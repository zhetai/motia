import { StateAdapter } from '../state-adapter'

export class MemoryStateAdapter implements StateAdapter {
  private state: Record<string, any> = {}

  async init() {
    this.state = {}
  }

  async get(traceId: string, key: string) {
    const fullKey = this._makeKey(traceId, key)

    return this.state[fullKey] ? this.state[fullKey] : null
  }

  async set(traceId: string, key: string, value: any) {
    const fullKey = this._makeKey(traceId, key)

    this.state[fullKey] = value
  }

  async delete(traceId: string, key: string) {
    const fullKey = this._makeKey(traceId, key)

    delete this.state[fullKey]
  }

  async clear(traceId: string) {
    const pattern = this._makeKey(traceId, '')

    for (const key in this.state) {
      if (key.startsWith(pattern)) {
        delete this.state[key]
      }
    }
  }

  async cleanup() {
    // No cleanup needed for file system
  }

  private _makeKey(traceId: string, key: string) {
    return `${traceId}:${key}`
  }
}
