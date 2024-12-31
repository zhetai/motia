import { StateAdapter } from '../StateAdapter.js';
import Redis from 'ioredis';

export class RedisStateAdapter extends StateAdapter {
  constructor(config) {
    super();
    this.client = new Redis(config);
    this.prefix = 'wistro:state:';
    this.ttl = config.ttl || 3600; // Default 1 hour TTL
  }

  async get(traceId, key) {
    const fullKey = this._makeKey(traceId, key);
    const value = await this.client.get(fullKey);
    return value ? JSON.parse(value) : null;
  }

  async set(traceId, key, value) {
    const fullKey = this._makeKey(traceId, key);
    await this.client.set(fullKey, JSON.stringify(value), 'EX', this.ttl);
  }

  async delete(traceId, key) {
    const fullKey = this._makeKey(traceId, key);
    await this.client.del(fullKey);
  }

  async clear(traceId) {
    const pattern = this._makeKey(traceId, '*');
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  async cleanup() {
    await this.client.quit();
  }

  _makeKey(traceId, key) {
    return `${this.prefix}${traceId}:${key}`;
  }
}
