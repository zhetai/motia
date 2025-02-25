import readline from 'readline'

export class CLIOutputManager {
  private lines: Map<string, number> = new Map() // Track line positions
  private lineCount = 0

  logStep(id: string, message: string) {
    this.lines.set(id, this.lineCount)
    process.stdout.write(`${message}\n`)
    this.lineCount++
  }

  updateStep(id: string, newMessage: string) {
    const lineIndex = this.lines.get(id)
    if (lineIndex === undefined) return

    readline.moveCursor(process.stdout, 0, -(this.lineCount - lineIndex))
    readline.clearLine(process.stdout, 0)
    process.stdout.write(`${newMessage}\n`)
    readline.moveCursor(process.stdout, 0, this.lineCount - lineIndex - 1)
  }
}
