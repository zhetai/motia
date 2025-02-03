import chokidar, { FSWatcher } from 'chokidar'
import { randomUUID } from 'crypto'
import { getStepConfig, LockedData, Step } from '@motiadev/core'

type StepChangeHandler = (oldStep: Step, newStep: Step) => void
type StepCreateHandler = (step: Step) => void
type StepDeleteHandler = (step: Step) => void

export class Watcher {
  private watcher?: FSWatcher
  private stepChangeHandler?: StepChangeHandler
  private stepCreateHandler?: StepCreateHandler
  private stepDeleteHandler?: StepDeleteHandler

  constructor(
    private readonly dir: string,
    private lockedData: LockedData,
  ) {}

  onStepChange(handler: StepChangeHandler) {
    this.stepChangeHandler = handler
  }

  onStepCreate(handler: StepCreateHandler) {
    this.stepCreateHandler = handler
  }

  onStepDelete(handler: StepDeleteHandler) {
    this.stepDeleteHandler = handler
  }

  private findStep(path: string): Step | undefined {
    return (
      this.lockedData.activeSteps.find((step) => step.filePath === path) ||
      this.lockedData.devSteps.find((step) => step.filePath === path)
    )
  }

  private async onFileAdd(path: string): Promise<void> {
    if (!this.stepCreateHandler) {
      console.warn(`No step create handler, step skipped`)
      return
    }

    const config = await getStepConfig(path)

    if (!config) {
      console.warn(`No config found in step ${path}, step skipped`)
      return
    }

    const version = `${randomUUID()}:${Math.floor(Date.now() / 1000)}`
    const step: Step = { filePath: path, version, config }

    this.stepCreateHandler?.(step)
  }

  private async onFileChange(path: string): Promise<void> {
    if (!this.stepChangeHandler) {
      console.warn(`No step change handler, step skipped`)
      return
    }

    const config = await getStepConfig(path)
    const step = this.findStep(path)

    if (!step && !config) {
      console.warn(`Step ${path} not found, step skipped`)
      return
    }

    // didn't have a step, but now we have a config
    if (!step && config) {
      const version = `${randomUUID()}:${Math.floor(Date.now() / 1000)}`
      const step: Step = { filePath: path, version, config }

      this.stepCreateHandler?.(step)
    }

    // had a step, and now we have a config
    if (step && config) {
      const newStep: Step = { ...step, config }
      this.stepChangeHandler?.(step, newStep)
    }

    // had a step, but no config
    if (step && !config) {
      this.stepDeleteHandler?.(step)
    }
  }

  private async onFileDelete(path: string): Promise<void> {
    if (!this.stepDeleteHandler) {
      console.warn(`No step delete handler, step skipped`)
      return
    }

    const step = this.findStep(path)

    if (!step) {
      console.warn(`Step ${path} not found, step skipped`)
      return
    }

    this.stepDeleteHandler?.(step)
  }

  init() {
    this.watcher = chokidar
      .watch(this.dir, { persistent: true, ignoreInitial: true })
      .on('add', (path) => this.isStepFile(path) && this.onFileAdd(path))
      .on('change', (path) => this.isStepFile(path) && this.onFileChange(path))
      .on('unlink', (path) => this.isStepFile(path) && this.onFileDelete(path))
  }

  private isStepFile(path: string): boolean {
    return /\.step\.[^.]+$/.test(path) && !/\.tsx$/.test(path)
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close()
    }
  }
}
