import { InternalStateManager } from '../types'

/**
 * Interface for state management adapters
 */
export interface StateAdapter extends InternalStateManager {
  clear(traceId: string): Promise<void>
  cleanup(): Promise<void>

  keys(traceId: string): Promise<string[]>
  traceIds(): Promise<string[]>
}
