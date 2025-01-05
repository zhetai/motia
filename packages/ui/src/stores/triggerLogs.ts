import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TriggerLogsState = {
  messages: Record<string, string>
  addMessage: (id: string, message: string) => void
  resetMessages: () => void
}

export const useTriggerLogs = create<TriggerLogsState>()(
  persist(
    (set) => ({
      messages: {},
      addMessage: (id, message) =>
        set((state) =>
          id in state.messages ? state : { ...state, messages: { ...state.messages, [id]: message.replace('\\', '') } },
        ),
      resetMessages: () => set({ messages: {} }),
    }),
    {
      name: 'trigger-logs',
    },
  ),
)
