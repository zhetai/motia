import { InternalStateManager } from '../types'

type Input = {
  stateManagerUrl: string
}

const getStateManagerHandler =
  (stateManagerUrl: string) =>
  async (
    action: 'set' | 'get' | 'delete',
    payload: { traceId: string; key?: string; value?: unknown },
  ): Promise<{ data: unknown } | void> => {
    try {
      const response = await fetch(`${stateManagerUrl}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-trace-id': payload.traceId,
          // TODO: add internal auth token for security
        },
        // TODO: encrypt the payload for security
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('[internal state manager] failed posting state change, response ok status is false')
        throw Error('Failed posting state change, response ok status is false')
      }

      if (action === 'get') {
        const result = await response.json()

        return result.data
      }
    } catch (error) {
      console.error('[internal state manager] failed posting state change', error)

      throw Error('Failed posting state change')
    }
  }

export const createInternalStateManager = ({ stateManagerUrl }: Input): InternalStateManager => {
  const handler = getStateManagerHandler(stateManagerUrl)

  return {
    get: <T>(traceId: string, key: string) => handler('get', { traceId, key }) as Promise<{ data: T }>,
    set: (traceId: string, key: string, value: unknown) => handler('set', { traceId, key, value }) as Promise<void>,
    delete: async (traceId: string, key: string) => handler('set', { traceId, key }) as Promise<void>,
  }
}
