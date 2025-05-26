import { LockedData } from '../locked-data'
import { StateStream } from '../state-stream'

export type Flow = {
  id: string
  name: string
}

export class FlowsStream extends StateStream<Flow> {
  constructor(private readonly lockedData: LockedData) {
    super()
  }

  async get(id: string): Promise<Flow | null> {
    return (
      Object.entries(this.lockedData.flows)
        .map(([id, flow]) => ({ id, name: flow.name }))
        .find((flow) => flow.id === id) ?? null
    )
  }

  async delete(id: string): Promise<Flow | null> {
    return { id, name: id }
  }

  async set(_: string, __: string, data: Flow): Promise<Flow> {
    return data
  }

  async getGroup(): Promise<Flow[]> {
    /**
     * Get list should receive a groupId argument but that's irrelevant for this stream
     * since we only have one group of flows.
     */
    return Object.entries(this.lockedData.flows).map(([id, flow]) => ({ id, name: flow.name }))
  }
}
