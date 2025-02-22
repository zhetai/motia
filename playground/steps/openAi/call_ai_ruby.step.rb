def config
  {
    type: 'event',
    name: 'Call OpenAI',
    description: 'Call OpenAI API',
    subscribes: ['call-openai'],
    emits: ['openai-response'],
    flows: ['openai']
  }
end

def handler(args, ctx)
  ctx.logger.info('[Call Ruby OpenAI] Received call_ai event', args)

  message = args["message"]
  if message.nil?
    ctx.logger.warn('Message not found in args')
    return
  end

  ctx.emit({
    "topic" => "openai-response",
    "data" => { "message" => message }
  })
end
