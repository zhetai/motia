import { RedisStateAdapter } from './adapters/RedisStateAdapter.js';

export function createStateAdapter(config = {}) {
  const { adapter = 'redis', ...adapterConfig } = config;

  switch (adapter) {
    case 'redis':
      return new RedisStateAdapter(adapterConfig);
    default:
      throw new Error(`Unknown state adapter type: ${adapter}`);
  }
}
