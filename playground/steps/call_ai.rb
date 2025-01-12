class Config
  attr_reader :name, :subscribes, :emits, :input, :flows

  def initialize
    @name = "Call OpenAI"
    @subscribes = ["call-openai"]
    @emits = ["openai-response"]
    @input = nil # No schema validation
    @flows = ["openai"]
  end
end

config = Config.new

def executor(args, emit, ctx)
  ctx.logger.info('[Call Ruby OpenAI] Received call_ai event', args)

  message = args["message"]
  if message.nil?
    ctx.logger.warn('Message not found in args')
    return
  end

  emit.call({
    "type" => "openai-response",
    "data" => { "message" => message }
  })
end
