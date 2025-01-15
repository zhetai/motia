const Redis = require('ioredis')

class StateAdapter {
  ttl = 300 // Default TTL in seconds

  constructor(traceId, stateConfig) {
    this.traceId = traceId
    this.client = new Redis(stateConfig)
    this.prefix = 'motia:state'
    this.rootKey = this._makeRootKey()

    if (stateConfig.ttl) {
      this.ttl = stateConfig.ttl
    }
  }

  async get(path) {
    const fullPath = this._makePath(path)
    const value = await this.client.call('JSON.GET', this.rootKey, fullPath)

    if (typeof value === 'string') {
      return JSON.parse(value)[0]
    }
    return value ?? null
  }

  async preparePath(path) {
    const segments = path.split('.')
    let currentKey = ''

    for (const segment of segments) {
      currentKey = currentKey ? `${currentKey}.${segment}` : segment
      const exists = await this.client.call('JSON.GET', this.rootKey, currentKey)
      if (!exists) {
        await this.client.call('JSON.SET', this.rootKey, currentKey, '{}')
      }
    }
  }

  async set(path, value) {
    const nextPath = this._makePath(path)

    await this.preparePath(nextPath)

    await this.client
      .multi()
      .call('JSON.SET', this.rootKey, nextPath, JSON.stringify(value))
      .call('EXPIRE', this.rootKey, this.ttl)
      .exec()
  }

  async delete(path) {
    if (!path) {
      await this.client.del(this.rootKey)
      return
    }

    const fullPath = this._makePath(path)
    await this.client.call('JSON.DEL', this.rootKey, fullPath)
  }

  async clear() {
    await this.client.del(this.rootKey)
  }

  async cleanup() {
    await this.client.quit()
  }

  _makeRootKey() {
    return `${this.prefix}:${this.traceId}`
  }

  _makePath(path) {
    return `$${path ? '.' + path : ''}`
  }
}

module.exports = { StateAdapter }
