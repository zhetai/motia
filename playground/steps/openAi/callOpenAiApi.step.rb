def config
  {
    type: 'api',
    name: 'Call OpenAI',
    description: 'Call OpenAI API',
    path: '/openai-ruby',
    method: 'POST', 
    emits: ['call-openai'],
    flows: ['openai']
  }
end

def handler(req, ctx)
  ctx.logger.info('[Call OpenAI] Received callOpenAi event', req)

  message = req.body["message"]
  if message.nil?
    ctx.logger.warn('Message not found in request body')
    return
  end

  ctx.emit({
    "type" => "call-openai",
    "data" => { "message" => message }
  })

  {
    "status" => 200,
    "body" => { "message" => "OpenAI request sent, RUBY" }
  }
end
