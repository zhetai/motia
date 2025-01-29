require 'ostruct'

def config
  {
    type: "event",
    name: "Test State With Ruby",
    subscribes: ["check-state-change"],
    emits: [],
    input: nil,
    flows: ["test-state"]
  }
end

  def initialize
    @type = "event"
    @name = "Test State With Ruby"
    @subscribes = ["check-state-change"]
    @emits = []
    @input = nil # No schema validation
    @flows = ["test-state"]
  end

def deep_compare(obj1, obj2)
  # If both objects are nil, they are equal
  return true if obj1.nil? && obj2.nil?

  # If one of them is nil, they are not equal
  return false if obj1.nil? || obj2.nil?

  # If they are the same object, no need to compare further
  return true if obj1.equal?(obj2)

  # If both objects are OpenStruct, compare their attributes
  if obj1.is_a?(OpenStruct) && obj2.is_a?(OpenStruct)
    # Compare attributes recursively
    return deep_compare(obj1.to_h, obj2.to_h)
  end

  # If both objects are Hash, compare them recursively
  if obj1.is_a?(Hash) && obj2.is_a?(Hash)
    return obj1.keys.sort == obj2.keys.sort && obj1.all? { |key, value| deep_compare(value, obj2[key]) }
  end

  # If both objects are Arrays, compare elements recursively
  if obj1.is_a?(Array) && obj2.is_a?(Array)
    return obj1.length == obj2.length && obj1.each_with_index.all? { |item, index| deep_compare(item, obj2[index]) }
  end

  # Otherwise, compare the objects directly
  obj1 == obj2
end

def handler(args, ctx)
  ctx.logger.info('[Test motia state with ruby] Received call_ai event', args)

  value = ctx.state[:get].call(ctx.trace_id, args["key"])

  if !deep_compare(value[:data], args["expected"])
    ctx.logger.warn('[evaluate motia state with ruby] state value is not as expected', { value: value, expected: args["expected"] })
  else
    ctx.logger.warn('[evaluate motia state with ruby] state value matches 🏁 🟢')
  end
end
