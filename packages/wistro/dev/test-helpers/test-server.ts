import { buildFlows } from './../flow-builder'
import { createEventManager } from './../event-manager'
import { createServer } from './../server'
import { WistroServer, EventManager, Event } from './../../wistro.types'
import { createFlowHandlers } from './../flow-handlers'
import { loadLockFile } from '../load-lock-file'
import { createStateAdapter } from '../../state/createStateAdapter'

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
  const steps = await buildFlows(lockData)
  const eventManager = createEventManager(eventSubscriber as (event: Event<unknown>) => void)
  const state = createStateAdapter(lockData)
  const { server } = await createServer({
    steps,
    state,
    eventManager,
    skipSocketServer: true,
    port: 3000,
  })

  createFlowHandlers(steps, eventManager, lockData.state)

  return { server, eventManager }
}
