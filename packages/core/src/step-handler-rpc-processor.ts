import { ChildProcess } from 'child_process'

type RpcHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>
export type RpcMessage = {
  type: 'rpc_request'
  id: string | undefined
  method: string
  args: unknown
}

export class RpcProcessor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Record<string, RpcHandler<any, any>> = {}

  constructor(private child: ChildProcess) {}

  handler<TInput, TOutput = unknown>(method: string, handler: RpcHandler<TInput, TOutput>) {
    this.handlers[method] = handler
  }

  async handle(method: string, input: unknown) {
    const handler = this.handlers[method]
    if (!handler) {
      throw new Error(`Handler for method ${method} not found`)
    }
    return handler(input)
  }

  private response(id: string | undefined, result: unknown, error: unknown) {
    if (id) {
      this.child.send?.({ type: 'rpc_response', id, result, error })
    }
  }

  async init() {
    this.child.on('message', (msg: RpcMessage) => {
      if (msg.type === 'rpc_request') {
        const { id, method, args } = msg
        this.handle(method, args)
          .then((result) => this.response(id, result, null))
          .catch((error) => this.response(id, null, error))
      }
    })
  }
}
