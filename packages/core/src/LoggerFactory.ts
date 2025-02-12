import { Server } from 'socket.io'
import { Logger } from './logger'

type CreateLogger = {
  traceId: string
  flows?: string[]
  stepName: string
}

export class LoggerFactory {
  constructor(
    private readonly isVerbose: boolean,
    private readonly socketServer: Server,
  ) {}

  create({ stepName, traceId, flows }: CreateLogger): Logger {
    return new Logger(traceId, flows, stepName, this.isVerbose, this.socketServer)
  }
}
