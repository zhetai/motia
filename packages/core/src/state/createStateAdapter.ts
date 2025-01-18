import { FileAdapterConfig, FileStateAdapter } from './adapters/DefaultStateAdapter'
import { RedisAdapterConfig, RedisStateAdapter } from './adapters/RedisStateAdapter'

type BaseConfig = {
  // NOTE: add more adapters here
  adapter: 'default' | 'redis'
}

export type AdapterConfig = (BaseConfig & RedisAdapterConfig) | Record<string, unknown>

export function createStateAdapter(config: Record<string, unknown>) {
  const { adapter = 'redis', ...adapterConfig } = config

  switch (adapter) {
    case 'redis':
      return new RedisStateAdapter(adapterConfig as RedisAdapterConfig)
    case 'default':
      return new FileStateAdapter(adapterConfig as FileAdapterConfig)
    default:
      throw new Error(`Unknown state adapter type: ${adapter}`)
  }
}
