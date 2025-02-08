import { create } from 'zustand'

export type Log = {
  level: string
  time: number
  msg: string
  traceId: string
  flows: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export type LogsState = {
  logs: Log[]
  addLog: (log: Log) => void
  resetLogs: () => void
  unreadLogsCount: number
  setUnreadLogsCount: (count: number) => void
}

export const useLogs = create<LogsState>()((set) => ({
  logs: [],
  addLog: (log) =>
    set((state) => ({ ...state, logs: [log, ...state.logs], unreadLogsCount: state.unreadLogsCount + 1 })),
  resetLogs: () => set({ logs: [], unreadLogsCount: 0 }),
  unreadLogsCount: 0,
  setUnreadLogsCount: (count) => set({ unreadLogsCount: count }),
}))
