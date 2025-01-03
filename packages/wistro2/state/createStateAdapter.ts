import { RedisAdapterConfig, RedisStateAdapter } from './adapters/RedisStateAdapter.js';

type BaseConfig = {
  // NOTE: add more adapters here
  adapter: 'redis';
}

export type AdapterConfig = BaseConfig & RedisAdapterConfig | Record<string, unknown>;

export function createStateAdapter(config: Record<string, unknown>) {
  const { adapter = 'redis', ...adapterConfig } = config;

  switch (adapter) {
    case 'redis':
      return new RedisStateAdapter(adapterConfig as RedisAdapterConfig);
    default:
      throw new Error(`Unknown state adapter type: ${adapter}`);
  }
}
