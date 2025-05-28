import { Message } from '../../cli-output-manager'

export abstract class AbstractCliError extends Error {
  constructor(message: string) {
    super(message)
  }

  abstract print(message: Message): void
}

export class CliError extends AbstractCliError {
  print(message: Message): void {
    message.append(this.message)
  }
}
