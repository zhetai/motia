import { TracerFactory } from '.'
import { LockedData } from '../locked-data'
import { Logger } from '../logger'
import { Step } from '../types'
import { MotiaStream } from '../types-stream'
import { createTrace } from './create-trace'
import { StreamTracer } from './stream-tracer'
import { TraceManager } from './trace-manager'
import { Trace, TraceGroup } from './types'

export class BaseTracerFactory implements TracerFactory {
  constructor(
    private readonly traceStream: MotiaStream<Trace>,
    private readonly traceGroupStream: MotiaStream<TraceGroup>,
  ) {}

  createTracer(traceId: string, step: Step, logger: Logger) {
    const traceGroup: TraceGroup = {
      id: traceId,
      name: step.config.name,
      lastActivity: Date.now(),
      metadata: {
        completedSteps: 0,
        activeSteps: 0,
        totalSteps: 0,
      },
      correlationId: undefined,
      status: 'running',
      startTime: Date.now(),
    }

    const trace = createTrace(traceGroup, step)
    const manager = new TraceManager(this.traceStream, this.traceGroupStream, traceGroup, trace)

    return new StreamTracer(manager, traceGroup, trace, logger)
  }
}

export const createTracerFactory = (lockedData: LockedData): TracerFactory => {
  const traceStream = lockedData.createStream<Trace>({
    filePath: '__motia.trace',
    hidden: true,
    config: {
      name: 'motia-trace',
      baseConfig: { storageType: 'default' },
      schema: null as never,
    },
  })()

  const traceGroupStream = lockedData.createStream<TraceGroup>({
    filePath: '__motia.trace-group',
    hidden: true,
    config: {
      name: 'motia-trace-group',
      baseConfig: { storageType: 'default' },
      schema: null as never,
    },
  })()

  return new BaseTracerFactory(traceStream, traceGroupStream)
}
