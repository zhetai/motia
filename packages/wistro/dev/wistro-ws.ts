import { FastifyRequest } from 'fastify'
import { WebSocket as FSWebSocket } from '@fastify/websocket'
import { randomUUID } from 'crypto'

type MessageHandler = (message: string, sender: FSWebSocket) => void

const clients: Set<FSWebSocket> = new Set()

let messageHandler: MessageHandler = () => {}

// Add a new WebSocket client
export const addClient = (client: FSWebSocket) => {
  console.log('New client connected')

  clients.add(client)

  client?.on('message', (message) => {
    messageHandler(message.toString(), client)
  })

  client?.on('close', () => {
    console.log('Client disconnected')
    clients.delete(client)
  })
}

// Broadcast a message to all connected clients
export const broadcast = (message: string, exclude?: FSWebSocket) => {
  for (const client of clients) {
    if (client !== exclude && client.readyState === 1) {
      client.send(JSON.stringify({ id: randomUUID(), payload: message }))
    }
  }
}

export const broadcastLog = (message: string, gravy?: Record<string, unknown>) =>
  broadcast(JSON.stringify({ type: 'log', message: `${message} ${gravy ? JSON.stringify(gravy, null, 2) : ''}` }))

// Set a custom message handler
export const setMessageHandler = (handler: MessageHandler) => {
  messageHandler = handler
}

// Get the number of connected clients
export const getClientCount = (): number => clients.size

export const wistroWsRouteHandler = (socket: FSWebSocket) => {
  // Add the client to the WebSocket manager
  addClient(socket)

  console.log('[Wistro WS] client connected')
}
