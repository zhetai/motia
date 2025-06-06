import { Logger } from './logger'
import { StreamAdapter } from './streams/adapters/stream-adapter'
import { Log } from './streams/logs-stream'

type CreateLogger = {
  traceId: string
  flows?: string[]
  stepName: string
}

export class LoggerFactory {
  constructor(
    private readonly isVerbose: boolean,
    private readonly logStream: StreamAdapter<Log>,
  ) {}

  create({ stepName, traceId, flows }: CreateLogger): Logger {
    return new Logger(traceId, flows, stepName, this.isVerbose, this.logStream)
  }
}
