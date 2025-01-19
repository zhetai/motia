import type { InternalStateManager } from '../types'

type Input = {
  stateManagerUrl: string
}

const getStateManagerHandler =
  (stateManagerUrl: string) =>
  async (
    action: 'set' | 'get' | 'delete' | 'clear',
    payload: { traceId: string; key?: string; value?: unknown },
  ): Promise<{ data: unknown } | void> => {
    try {
      const response = await fetch(`${stateManagerUrl}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-trace-id': payload.traceId,
        },
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
    get: async <T>(traceId: string, key: string) => {
      const result = await handler('get', { traceId, key })

      console.log('result', result)

      return result as T
    },
    set: async (traceId: string, key: string, value: unknown) => {
      await handler('set', { traceId, key, value })
    },
    delete: async (traceId: string, key: string) => {
      await handler('delete', { traceId, key })
    },
    clear: async (traceId: string) => {
      await handler('clear', { traceId })
    },
  }
}
