export const initialNodes = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 200, y: 0 },
    data: {
      label: 'API Endpoint',
      description: 'Triggered when a message is received from chatbot',
      emits: ['promptOpenAI'],
      action: 'webhook',
      webhookUrl: 'POST /api/message',
    },
  },
  {
    id: '2',
    type: 'base',
    position: { x: 0, y: 200 },
    data: {
      label: 'Process Message',
      description: 'Triggered when a message is received from chatbot',
      subscribes: ['promptOpenAI'],
      emits: ['sendMessage'],
    },
  },
  {
    id: '3',
    type: 'base',
    position: { x: 500, y: 200 },
    data: {
      label: 'Prompt OpenAI',
      description: 'Calls OpenAI API to generate a response',
      subscribes: ['promptOpenAI'],
      emits: ['sendMessage', 'executePayment'],
    },
  },
  {
    id: '4',
    type: 'base',
    position: { x: 700, y: 400 },
    data: {
      label: 'Execute Payment',
      description: 'Process payment transaction',
      subscribes: ['executePayment'],
      emits: ['sendMessage'],
    },
  },
  {
    id: '5',
    type: 'base',
    position: { x: 200, y: 800 },
    data: {
      label: 'Send Message',
      description: 'Sends a message back to the client',
      subscribes: ['sendMessage'],
      emits: [],
    },
  },

  {
    id: '6',
    type: 'trigger',
    position: { x: 850, y: 200 },
    data: {
      label: 'Stripe Webhook',
      description: 'Triggered when a payment is updated',
      emits: ['paymentUpdated'],
      action: 'webhook',
      webhookUrl: 'POST /stripe/webhook',
    },
  },
  {
    id: '7',
    type: 'base',
    position: { x: 875, y: 550 },
    data: {
      label: 'Process Stripe Webhook',
      description: 'Processes the Stripe webhook',
      subscribes: ['paymentUpdated'],
      emits: ['sendMessage'],
    },
  },
]
export const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'base', label: 'promptOpenAI' },
  { id: 'e2-3', source: '1', target: '3', type: 'base', label: 'promptOpenAI' },
  { id: 'e3-4', source: '3', target: '4', type: 'base', label: 'needs payment?', data: { variant: 'conditional' } },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    type: 'base',
    label: 'verification complete',
    data: { variant: 'conditional' },
  },
  { id: 'e2-5', source: '2', target: '5', type: 'base', label: 'response from AI' },
  { id: 'e4-5', source: '4', target: '5', type: 'base', label: 'payment being processed' },
  { id: 'e6-7', source: '6', target: '7', type: 'base', label: 'paymentUpdated' },
  { id: 'e7-5', source: '7', target: '5', type: 'base', label: 'send payment status' },
]
