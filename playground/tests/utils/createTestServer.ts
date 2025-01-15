import {
  createEventManager,
  createServer,
  MotiaServer,
  EventManager,
  Event,
  createStepHandlers,
  createStateAdapter,
} from '@motia/core'
import { generateLockedData } from '@motia/snap/src/generate/locked-data'

type Response = Promise<{
  eventManager: EventManager
  server: MotiaServer
}>

export const createTestServer = async <EData>(
  workingDir: string,
  eventSubscriber?: (event: Event<EData>) => void,
  configOverrides?: Partial<{ port: number }>,
): Response => {
  const lockedData = await generateLockedData(workingDir)
  const steps = [...lockedData.steps.active, ...lockedData.steps.dev]
  const eventManager = createEventManager(eventSubscriber as (event: Event<unknown>) => void)
  const state = createStateAdapter(lockedData.state)
  const { server } = await createServer({
    port: configOverrides?.port ?? 3000,
    steps,
    flows: lockedData.flows,
    state,
    eventManager,
  })

  createStepHandlers(steps, eventManager, lockedData.state)

  return { server, eventManager }
}
