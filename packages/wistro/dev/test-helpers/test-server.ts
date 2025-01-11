import { Config } from './../config.types'
import { buildFlows } from './../flow-builder'
import { createEventManager } from './../event-manager'
import { createServer } from './../server'
import { WistroServer, EventManager, Event } from './../../wistro.types'
import { createFlowHandlers } from './../flow-handlers'
import { loadLockFile } from '../load-lock-file'

type Response = Promise<{
  eventManager: EventManager
  server: WistroServer
}>

export const createTestServer = async <EData>(
  configPath: string,
  eventSubscriber?: (event: Event<EData>) => void,
  configOverrides?: Partial<{ port: number }>,
): Response => {
  const lockData = loadLockFile()
  const flowSteps = await buildFlows(lockData)
  const eventManager = createEventManager(eventSubscriber as (event: Event<unknown>) => void)
  const { server } = await createServer({ ...lockData, ...(configOverrides ?? {}) }, flowSteps, eventManager, {
    skipSocketServer: true,
  })

  createFlowHandlers(flowSteps, eventManager, lockData.state)

  return { server, eventManager }
}
