import { useSyncExternalStore, useCallback } from 'react'
import { Flow } from '@/hooks/use-list-flows'

export type FlowState = {
  currentFlow: Flow
  selectFlow: (flow: Flow) => void
}

const listeners = new Set<() => void>()

let currentFlow: Flow
let memoizedSnapshot: FlowState

const updateMemoizedSnapshot = () => {
  memoizedSnapshot = {
    currentFlow,
    selectFlow: storeActions.selectFlow,
  }
}

const notify = () => {
  listeners.forEach((listener) => listener())
}

const storeActions = {
  selectFlow: (flow: Flow) => {
    currentFlow = flow
    updateMemoizedSnapshot()
    notify()
  },
}

updateMemoizedSnapshot()

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

export function useFlow<SelectorOutput = FlowState>(
  selector: (state: FlowState) => SelectorOutput = (state) => state as unknown as SelectorOutput,
): SelectorOutput {
  const getSnapshot = useCallback(() => selector(memoizedSnapshot), [selector])

  return useSyncExternalStore(subscribe, getSnapshot)
}
