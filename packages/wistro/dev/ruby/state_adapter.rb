require 'json'

class StateAdapter
  attr_reader :trace_id, :store, :prefix, :ttl

  def initialize(trace_id, state_config)
    @trace_id = trace_id
    @store = {}
    @prefix = 'wistro:state:'
    @ttl = state_config.respond_to?(:ttl) ? state_config.ttl : nil
  end

  # Generates a namespaced key
  def make_key(key)
    "#{@prefix}#{@trace_id}:#{key}"
  end

  # Retrieves a value for a given key
  def get(key)
    full_key = make_key(key)
    value = @store[full_key]
    value ? JSON.parse(value) : nil
  end

  # Stores a value for a given key
  def set(key, value)
    full_key = make_key(key)
    @store[full_key] = JSON.dump(value)
  end

  # Deletes a value for a given key
  def delete(key)
    full_key = make_key(key)
    @store.delete(full_key)
  end

  # Clears all keys for the current trace ID
  def clear
    keys_to_delete = @store.keys.select { |k| k.start_with?(make_key('')) }
    keys_to_delete.each { |key| @store.delete(key) }
  end

  # Clears the entire store
  def cleanup
    @store.clear
  end
end
