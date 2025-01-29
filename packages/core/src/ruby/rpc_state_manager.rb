class RpcStateManager
  def initialize(sender)
    @sender = sender
  end

  def get(trace_id, key)
    # Return promise to match Python/Node behavior
    @sender.send('state.get', { traceId: trace_id, key: key })
  end

  def set(trace_id, key, value)
    # Return promise to match Python/Node behavior
    @sender.send('state.set', { traceId: trace_id, key: key, value: value })
  end

  def delete(trace_id, key)
    # Return promise to match Python/Node behavior
    @sender.send('state.delete', { traceId: trace_id, key: key })
  end

  def clear(trace_id)
    # Return promise to match Python/Node behavior
    @sender.send('state.clear', { traceId: trace_id })
  end
end