import { ZodObject } from 'zod'
import { ApiRouteConfig, CronConfig, EventConfig, Flow, Step } from './types'
import { isApiStep, isCronStep, isEventStep } from './guards'
import { validateStep } from './step-validator'
import { Printer } from './printer'

type FlowEvent = 'flow-created' | 'flow-removed' | 'flow-updated'

export class LockedData {
  public flows: Record<string, Flow>
  public activeSteps: Step[]
  public devSteps: Step[]
  public readonly printer: Printer

  private stepsMap: Record<string, Step>
  private handlers: Record<FlowEvent, ((flowName: string) => void)[]>

  constructor(public readonly baseDir: string) {
    this.flows = {}
    this.activeSteps = []
    this.devSteps = []
    this.stepsMap = {}
    this.printer = new Printer(baseDir)

    this.handlers = {
      'flow-created': [],
      'flow-removed': [],
      'flow-updated': [],
    }
  }

  on(event: FlowEvent, handler: (flowName: string) => void) {
    this.handlers[event].push(handler)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventSteps(): Step<EventConfig<ZodObject<any>>>[] {
    return this.activeSteps.filter(isEventStep)
  }

  apiSteps(): Step<ApiRouteConfig>[] {
    return this.activeSteps.filter(isApiStep)
  }

  cronSteps(): Step<CronConfig>[] {
    return this.activeSteps.filter(isCronStep)
  }

  updateStep(oldStep: Step, newStep: Step): boolean {
    if (!this.isValidStep(newStep)) {
      this.deleteStep(oldStep)

      return false
    }

    if (oldStep.config.type !== newStep.config.type) {
      this.activeSteps = this.activeSteps.filter((s) => s.filePath !== oldStep.filePath)
      this.devSteps = this.devSteps.filter((s) => s.filePath !== oldStep.filePath)

      if (newStep.config.virtualEmits) {
        this.devSteps.push(newStep)
      } else {
        this.activeSteps.push(newStep)
      }
    }

    const savedStep = this.stepsMap[newStep.filePath]
    const addedFlows = newStep.config.flows?.filter((flowName) => !oldStep.config.flows?.includes(flowName)) ?? []
    const removedFlows = oldStep.config.flows?.filter((flowName) => !newStep.config.flows?.includes(flowName)) ?? []
    const untouchedFlows = oldStep.config.flows?.filter((flowName) => newStep.config.flows?.includes(flowName)) ?? []

    untouchedFlows.forEach((flowName) => this.onFlowUpdated(flowName))

    for (const flowName of addedFlows) {
      if (!this.flows[flowName]) {
        const flow = this.createFlow(flowName)
        flow.steps.push(savedStep)
      } else {
        this.flows[flowName].steps.push(savedStep)
        this.onFlowUpdated(flowName)
      }
    }

    for (const flowName of removedFlows) {
      const flowSteps = this.flows[flowName].steps
      this.flows[flowName].steps = flowSteps.filter(({ filePath }) => filePath !== newStep.filePath)

      if (this.flows[flowName].steps.length === 0) {
        this.removeFlow(flowName)
      } else {
        this.onFlowUpdated(flowName)
      }
    }

    savedStep.config = newStep.config

    this.printer.printStepUpdated(newStep)

    return true
  }

  createStep(step: Step): boolean {
    if (!this.isValidStep(step)) {
      return false
    }

    this.stepsMap[step.filePath] = step

    if (step.config.virtualEmits) {
      this.devSteps.push(step)
    } else {
      this.activeSteps.push(step)
    }

    for (const flowName of step.config.flows ?? []) {
      if (!this.flows[flowName]) {
        const flow = this.createFlow(flowName)
        flow.steps.push(step)
      } else {
        this.flows[flowName].steps.push(step)
        this.onFlowUpdated(flowName)
      }
    }

    this.printer.printStepCreated(step)

    return true
  }

  deleteStep(step: Step): void {
    // Remove step from active and dev steps
    this.activeSteps = this.activeSteps.filter(({ filePath }) => filePath !== step.filePath)
    this.devSteps = this.devSteps.filter(({ filePath }) => filePath !== step.filePath)

    delete this.stepsMap[step.filePath]

    for (const flowName of step.config.flows ?? []) {
      const stepFlows = this.flows[flowName]?.steps

      if (stepFlows) {
        this.flows[flowName].steps = stepFlows.filter(({ filePath }) => filePath !== step.filePath)
      }

      if (this.flows[flowName].steps.length === 0) {
        this.removeFlow(flowName)
      } else {
        this.onFlowUpdated(flowName)
      }
    }

    this.printer.printStepRemoved(step)
  }

  private createFlow(flowName: string): Flow {
    const flow = { name: flowName, description: '', steps: [] }
    this.flows[flowName] = flow
    this.handlers['flow-created'].forEach((handler) => handler(flowName))
    this.printer.printFlowCreated(flowName)

    return flow
  }

  private removeFlow(flowName: string): void {
    delete this.flows[flowName]
    this.handlers['flow-removed'].forEach((handler) => handler(flowName))
    this.printer.printFlowRemoved(flowName)
  }

  private onFlowUpdated(flowName: string): void {
    this.handlers['flow-updated'].forEach((handler) => handler(flowName))
  }

  private isValidStep(step: Step): boolean {
    const validationResult = validateStep(step)

    if (!validationResult.success) {
      this.printer.printValidationError(step.filePath, validationResult)
    }

    return validationResult.success
  }
}
