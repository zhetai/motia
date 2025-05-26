import type { InternalStateManager } from './types'
import type { BaseStreamItem, IStateStream, StateStreamEvent, StateStreamEventChannel } from './types-stream'

export type StateStreamFactory<TData> = () => IStateStream<TData>

export abstract class StateStream<TData> implements IStateStream<TData> {
  abstract get(groupId: string, id: string): Promise<BaseStreamItem<TData> | null>
  abstract set(groupId: string, id: string, data: TData): Promise<BaseStreamItem<TData> | null>
  abstract delete(groupId: string, id: string): Promise<BaseStreamItem<TData> | null>
  abstract getGroup(groupId: string): Promise<BaseStreamItem<TData>[]>

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async send<T>(channel: StateStreamEventChannel, event: StateStreamEvent<T>): Promise<void> {}
}

export class InternalStateStream<TData> extends StateStream<TData> {
  constructor(private readonly state: InternalStateManager) {
    super()
  }

  async get(groupId: string, id: string): Promise<BaseStreamItem<TData> | null> {
    return this.state.get<BaseStreamItem<TData>>(groupId, id)
  }

  async set(groupId: string, id: string, data: TData): Promise<BaseStreamItem<TData> | null> {
    return this.state.set<BaseStreamItem<TData>>(groupId, id, { id, ...data })
  }

  async delete(groupId: string, id: string): Promise<BaseStreamItem<TData> | null> {
    return this.state.delete<BaseStreamItem<TData>>(groupId, id)
  }

  async getGroup(groupId: string): Promise<BaseStreamItem<TData>[]> {
    return this.state.getGroup<BaseStreamItem<TData>>(groupId)
  }

  async send() {}
}
