export type Event<TData> = {
  type: string
  data: TData
  traceId: string
}

type Handler<TData = unknown> = (event: Event<TData>) => Promise<void>

export type EventManager = {
  emit: <TData>(event: Event<TData>) => Promise<void>
  subscribe: <TData>(event: string, handlerName: string, handler: Handler<TData>) => void
}

export const createEventManager = (): EventManager => {
  const handlers: Record<string, Handler[]> = {}

  const emit = async <TData>(event: Event<TData>) => {
    const handler = handlers[event.type] ?? []

    console.log(`[Workflow Emit] ${event.type} emitted`, { handlers: handler.length })

    await Promise.all(handler.map((h) => h(event)))
  }

  const subscribe = <TData>(event: string, handlerName: string, handler: Handler<TData>) => {
    if (!handlers[event]) {
      handlers[event] = []
    }

    console.log(`[Workflow Sub] ${handlerName} subscribing to ${event}`)

    handlers[event].push(handler as Handler)
  }

  return { emit, subscribe }
}
