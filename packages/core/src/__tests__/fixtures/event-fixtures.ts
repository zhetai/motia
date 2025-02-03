import { BaseLogger } from '../../logger'
import { Event } from '../../types'

const logger = new BaseLogger()

export const createEvent = (event: Partial<Event> = {}): Event => ({
  type: 'TEST_EVENT',
  data: { test: 'data' },
  traceId: '123',
  logger,
  ...event,
})
