import inquirer from 'inquirer'
import { create } from './index'
import { CliContext } from '../cloud/config-utils'

interface InteractiveAnswers {
  template: string
  useCurrentFolder: boolean
  folderName?: string
  addCursorRules: boolean
}

const choices: Record<string, string> = {
  default: 'Base (TypeScript)',
  python: 'Base (Python)',
}

interface CreateInteractiveArgs {
  skipConfirmation?: boolean
  context: CliContext
}

export const createInteractive = async ({ skipConfirmation, context }: CreateInteractiveArgs): Promise<void> => {
  context.log('welcome', (message) => message.tag('info').append('Welcome to Motia Project Creator!'))

  const answers: InteractiveAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'What template do you want to use?',
      choices: Object.keys(choices).map((key) => ({
        name: choices[key],
        value: key,
      })),
    },
    {
      type: 'confirm',
      name: 'useCurrentFolder',
      message: 'Do you want to add motia to the current folder?',
      default: false,
    },
    {
      type: 'input',
      name: 'folderName',
      message: 'What should be the folder name?',
      when: (answers) => !answers.useCurrentFolder,
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Folder name is required'
        }
        if (!/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/.test(input.trim())) {
          return 'Folder name must start with a letter or number and contain only letters, numbers, hyphens, and underscores'
        }
        return true
      },
      filter: (input: string) => input.trim(),
    },
    {
      type: 'confirm',
      name: 'addCursorRules',
      message: 'Do you want to add cursor rules to help working with Motia project?',
      default: true,
    },
  ])

  context.log('project-configuration', (message) => message.tag('info').append('Project Configuration'))
  context.log('template', (message) =>
    message.tag('info').append('Template:').append(choices[answers.template], 'cyan'),
  )
  context.log('location', (message) =>
    message
      .tag('info')
      .append('Location:')
      .append(answers.useCurrentFolder ? 'Current folder' : answers.folderName || 'current', 'cyan'),
  )
  context.log('cursor-rules', (message) =>
    message
      .tag('info')
      .append('Cursor Rules:')
      .append(answers.addCursorRules ? 'Yes' : 'No', 'cyan'),
  )

  if (!skipConfirmation) {
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with project creation?',
        default: true,
      },
    ])

    if (!confirm.proceed) {
      context.log('project-creation-cancelled', (message) =>
        message.tag('warning').append('Project creation cancelled.'),
      )
      return
    }
  }

  context.log('creating-project', (message) => message.tag('info').append('Creating your Motia project...'))

  await create({
    projectName: answers.useCurrentFolder ? '.' : answers.folderName || '.',
    template: answers.template,
    cursorEnabled: answers.addCursorRules,
    context,
  })
}
