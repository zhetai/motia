import path from 'path'
import { LockedData } from '../locked-data'
import { createApiStep, createCronStep, createEventStep, createNoopStep } from './fixtures/step-fixtures'

describe('LockedData', () => {
  describe('step creation', () => {
    it('should add steps to activeSteps when created', () => {
      const lockedData = new LockedData(process.cwd())
      const step = createApiStep()
      lockedData.createStep(step)

      expect(lockedData.activeSteps).toHaveLength(1)
      expect(lockedData.activeSteps).toEqual([step])
    })

    it('should add steps to devSteps when virtualEmits is present', () => {
      const lockedData = new LockedData(process.cwd())
      const step = createNoopStep()

      lockedData.createStep(step)

      expect(lockedData.devSteps).toHaveLength(1)
      expect(lockedData.activeSteps).toHaveLength(0)
      expect(lockedData.devSteps).toEqual([step])
    })

    it('should create flows when they do not exist', () => {
      const lockedData = new LockedData(process.cwd())
      const step = createApiStep({ name: 'Test 1', flows: ['flow1', 'flow2'] })

      lockedData.createStep(step)

      expect(Object.keys(lockedData.flows)).toHaveLength(2)
      expect(lockedData.flows['flow1'].steps).toContain(step)
      expect(lockedData.flows['flow2'].steps).toContain(step)
    })
  })

  describe('step filtering', () => {
    let lockedData: LockedData

    const apiStep = createApiStep()
    const eventStep = createEventStep()
    const cronStep = createCronStep()

    beforeAll(() => {
      lockedData = new LockedData(process.cwd())
      lockedData.createStep(apiStep)
      lockedData.createStep(eventStep)
      lockedData.createStep(cronStep)
    })

    it('should filter api steps correctly', () => {
      const apiSteps = lockedData.apiSteps()
      expect(apiSteps).toHaveLength(1)
      expect(apiSteps).toEqual([apiStep])
    })

    it('should filter event steps correctly', () => {
      const eventSteps = lockedData.eventSteps()
      expect(eventSteps).toHaveLength(1)
      expect(eventSteps).toEqual([eventStep])
    })

    it('should filter cron steps correctly', () => {
      const cronSteps = lockedData.cronSteps()
      expect(cronSteps).toHaveLength(1)
      expect(cronSteps).toEqual([cronStep])
    })
  })

  describe('step changes', () => {
    it('should handle flow changes correctly', () => {
      const lockedData = new LockedData(process.cwd())
      const oldStep = createApiStep({ flows: ['flow-1', 'flow-2'] })
      lockedData.createStep(oldStep)

      expect(Object.keys(lockedData.flows)).toEqual(['flow-1', 'flow-2'])

      const newStep = createApiStep({ ...oldStep.config, flows: ['flow-2', 'flow-3'] })
      lockedData.updateStep(oldStep, newStep)

      expect(Object.keys(lockedData.flows)).toEqual(['flow-2', 'flow-3'])

      expect(lockedData.flows['flow-1']).toBeUndefined()
      expect(lockedData.flows['flow-2'].steps).toContainEqual(newStep)
      expect(lockedData.flows['flow-3'].steps).toContainEqual(newStep)
    })

    it('should handle type changes correctly', () => {
      const baseDir = '/test/dir'
      const lockedData = new LockedData(baseDir)
      const filePath = path.join(baseDir, 'steps/flow-1/step.ts')
      const oldStep = createApiStep({}, filePath)
      lockedData.createStep(oldStep)

      const newStep = createEventStep({}, filePath)
      lockedData.updateStep(oldStep, newStep)

      expect(lockedData.apiSteps()).toHaveLength(0)
      expect(lockedData.eventSteps()).toHaveLength(1)
    })
  })

  describe('step deletion', () => {
    it('should remove steps from activeSteps and flows', () => {
      const lockedData = new LockedData(process.cwd())
      const step = createApiStep({ flows: ['flow-1'] })

      lockedData.createStep(step)

      expect(Object.keys(lockedData.flows)).toEqual(['flow-1'])

      lockedData.deleteStep(step)

      expect(lockedData.activeSteps).toHaveLength(0)
      expect(lockedData.flows['flow-1']).toBeUndefined()
      expect(Object.keys(lockedData.flows)).toHaveLength(0)
    })

    it('should remove steps from devSteps', () => {
      const lockedData = new LockedData(process.cwd())
      const step = createNoopStep()

      lockedData.createStep(step)
      expect(lockedData.devSteps).toHaveLength(1)

      lockedData.deleteStep(step)
      expect(lockedData.devSteps).toHaveLength(0)
    })

    it('should keep flows with remaining steps', () => {
      const lockedData = new LockedData(process.cwd())

      const step1 = createApiStep({ flows: ['flow-1'] })
      const step2 = createEventStep({ flows: ['flow-1'] })

      lockedData.createStep(step1)
      lockedData.createStep(step2)

      expect(Object.keys(lockedData.flows)).toEqual(['flow-1'])

      lockedData.deleteStep(step1)

      expect(Object.keys(lockedData.flows)).toEqual(['flow-1'])
    })
  })

  describe('flow events', () => {
    it('should call handlers when flow is created', () => {
      const lockedData = new LockedData(process.cwd())
      const handler = jest.fn()

      lockedData.on('flow-created', handler)
      lockedData.createStep(createApiStep({ flows: ['flow-1'] }))

      expect(handler).toHaveBeenCalledWith('flow-1')
    })

    it('should call handlers when flow is removed', () => {
      const lockedData = new LockedData(process.cwd())
      const handler = jest.fn()
      const step = createApiStep({ flows: ['flow-1'] })

      lockedData.on('flow-removed', handler)

      lockedData.createStep(step)
      lockedData.deleteStep(step)

      expect(handler).toHaveBeenCalledWith('flow-1')
    })

    it('should call updated handlers when new step is added to flow', () => {
      const lockedData = new LockedData(process.cwd())
      const handler = jest.fn()

      lockedData.on('flow-updated', handler)
      lockedData.createStep(createApiStep({ flows: ['flow-1'] }))
      expect(handler).not.toHaveBeenCalled()

      lockedData.createStep(createEventStep({ flows: ['flow-1'] }))
      expect(handler).toHaveBeenCalledWith('flow-1')
    })

    it('should call handlers when step is removed from flow', () => {
      const lockedData = new LockedData(process.cwd())
      const updateHandler = jest.fn()
      const event = createEventStep({ flows: ['flow-1'] })

      lockedData.createStep(createApiStep({ flows: ['flow-1'] }))
      lockedData.createStep(event)

      // only after second step is added
      lockedData.on('flow-updated', updateHandler)
      expect(updateHandler).not.toHaveBeenCalled()

      lockedData.deleteStep(event)
      expect(updateHandler).toHaveBeenCalledWith('flow-1')
    })

    it('should not call removed handlers when step is removed from flow but flow is not empty', () => {
      const lockedData = new LockedData(process.cwd())
      const deleteHandler = jest.fn()
      const event = createEventStep({ flows: ['flow-1'] })

      lockedData.on('flow-removed', deleteHandler)

      lockedData.createStep(createApiStep({ flows: ['flow-1'] }))
      lockedData.createStep(event)
      expect(deleteHandler).not.toHaveBeenCalled()

      lockedData.deleteStep(event)
      expect(deleteHandler).not.toHaveBeenCalled()
    })

    it('should call handlers when step is updated inside a flow', () => {
      const lockedData = new LockedData(process.cwd())
      const updateHandler = jest.fn()
      const event = createEventStep({ flows: ['flow-1'] })

      lockedData.on('flow-updated', updateHandler)
      lockedData.createStep(event)
      expect(updateHandler).not.toHaveBeenCalled()

      lockedData.updateStep(event, createEventStep({ ...event.config, name: 'new-name' }))
      expect(updateHandler).toHaveBeenCalledWith('flow-1')
    })
  })
})
