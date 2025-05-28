export type LogRecord = {
  level: string
  msg: string
  timestamp: string
  meta: {
    traceId: string
    step: string
    version: string
    sourceIp?: string
  }
  values: Record<string, unknown>
}
