import colors from 'colors'
import path from 'path'
import { ValidationError } from './step-validator'
import { Step } from './types'
import { isApiStep, isCronStep, isEventStep, isNoopStep } from './guards'

export class Printer {
  private stepTag = colors.bold(colors.magenta('Step'))
  private flowTag = colors.bold(colors.blue('Flow'))

  constructor(private readonly baseDir: string) {}

  printStepCreated(step: Step) {
    console.log(
      `${colors.green('➜ [CREATED]')} ${this.stepTag} ${this.getStepType(step)} ${this.getStepPath(step)} created`,
    )
  }

  printStepUpdated(step: Step) {
    console.log(
      `${colors.yellow('➜ [UPDATED]')} ${this.stepTag} ${this.getStepType(step)} ${this.getStepPath(step)} updated`,
    )
  }

  printStepRemoved(step: Step) {
    console.log(
      `${colors.red('➜ [REMOVED]')} ${this.stepTag} ${this.getStepType(step)} ${this.getStepPath(step)} removed`,
    )
  }

  printFlowCreated(flowName: string) {
    console.log(`${colors.green('➜ [CREATED]')} ${this.flowTag} ${colors.bold(colors.cyan(flowName))} created`)
  }

  printFlowUpdated(flowName: string) {
    console.log(`${colors.yellow('➜ [UPDATED]')} ${this.flowTag} ${colors.bold(colors.cyan(flowName))} updated`)
  }

  printFlowRemoved(flowName: string) {
    console.log(`${colors.red('➜ [REMOVED]')} ${this.flowTag} ${colors.bold(colors.cyan(flowName))} removed`)
  }

  printValidationError(stepPath: string, validationError: ValidationError) {
    const relativePath = this.getRelativePath(stepPath)

    console.log(`${colors.red('[ERROR]')} ${colors.bold(colors.cyan(relativePath))}`)
    validationError.errors?.forEach((error) => {
      if (error.path) {
        console.log(`${colors.red('│')} ${colors.yellow(`✖ ${error.path}`)}: ${error.message}`)
      } else {
        console.log(`${colors.red('│')} ${colors.yellow('✖')} ${error.message}`)
      }
    })
    console.log(`${colors.red('└─')} ${colors.red(validationError.error)}  `)
  }

  private getRelativePath(filePath: string) {
    return path.relative(this.baseDir, filePath)
  }

  private getStepType(step: Step) {
    if (isApiStep(step)) return colors.gray('(API)')
    if (isEventStep(step)) return colors.gray('(Event)')
    if (isCronStep(step)) return colors.gray('(Cron)')
    if (isNoopStep(step)) return colors.gray('(Noop)')

    return colors.gray('(Unknown)')
  }

  private getStepPath(step: Step) {
    const stepPath = this.getRelativePath(step.filePath)
    return colors.bold(colors.cyan(stepPath))
  }
}
