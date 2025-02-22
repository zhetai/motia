def config
  {
    type: 'event',
    name: 'stepC',
    description: 'Hello from Step C',
    subscribes: ['pms.start'],
    emits: ['pms.stepC.done'],
    flows: ['parallel-merge']
  }
end

def handler(event, context)
  context.logger.info('[stepC] received pms.start')

  # Simulating async delay
  sleep(0.15)

  partial_result_c = {
    msg: 'Hello from Step C',
    timestamp: Time.now.to_i * 1000  # Converting to milliseconds to match JS Date.now()
  }

  context.state.set(context.trace_id, 'stepC', partial_result_c)

  context.emit({
    topic: 'pms.stepC.done',
    data: partial_result_c
  })
end
