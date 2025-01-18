const getStateManagerHandler = (stateManagerUrl) => async (action, payload) => {
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

const createInternalStateManager = ({ stateManagerUrl }) => {
  const handler = getStateManagerHandler(stateManagerUrl)

  return {
    get: (traceId, key) => handler('get', { traceId, key }).then((result) => ({ data: result })),
    set: (traceId, key, value) => handler('set', { traceId, key, value }),
    delete: (traceId, key) => handler('delete', { traceId, key }),
  }
}

module.exports = {
  createInternalStateManager,
}
