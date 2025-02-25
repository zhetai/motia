import { Step } from '@motiadev/core/dist/src/types'
import { CLIOutputManager } from './cli-output-manager'
import colors from 'colors'
import { Printer } from '@motiadev/core/dist/src/printer'

const building = colors.yellow('➜ [BUILDING]')
const built = colors.green('✓ [BUILT]')
const failed = colors.red('✘ [FAILED]')
const skipped = colors.gray('- [SKIPPED]')

export class BuildPrinter {
  private readonly printer = new Printer(process.cwd())
  private readonly output = new CLIOutputManager()

  printStepBuilding(step: Step) {
    const stepType = this.printer.getStepType(step)
    const stepPath = this.printer.getStepPath(step)
    const stepTag = this.printer.stepTag

    this.output.logStep(step.filePath, `${building} ${stepTag} ${stepType} ${stepPath}`)
  }

  printStepBuilt(step: Step) {
    const stepType = this.printer.getStepType(step)
    const stepPath = this.printer.getStepPath(step)
    const stepTag = this.printer.stepTag

    this.output.updateStep(step.filePath, `${built} ${stepTag} ${stepType} ${stepPath}`)
  }

  printStepFailed(step: Step, error: Error) {
    const stepType = this.printer.getStepType(step)
    const stepPath = this.printer.getStepPath(step)
    const stepTag = this.printer.stepTag

    this.output.updateStep(step.filePath, `${failed} ${stepTag} ${stepType} ${stepPath} ${error.message}`)
  }

  printStepSkipped(step: Step, reason: string) {
    const stepType = this.printer.getStepType(step)
    const stepPath = this.printer.getStepPath(step)
    const stepTag = this.printer.stepTag

    this.output.logStep(step.filePath, `${skipped} ${stepTag} ${stepType} ${stepPath} ${reason}`)
  }
}
