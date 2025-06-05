import inquirer from 'inquirer'
import colors from 'colors'
import { create } from './index'

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
}

export const createInteractive = async ({ skipConfirmation }: CreateInteractiveArgs): Promise<void> => {
  console.log('\n🚀 ', colors.bold('Welcome to Motia Project Creator!\n'))

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

  console.log('\n📋 ', colors.bold('Project Configuration:'))
  console.log(`Template: ${colors.cyan(choices[answers.template])}`)
  console.log(`Location: ${colors.cyan(answers.useCurrentFolder ? 'Current folder' : answers.folderName || 'current')}`)
  console.log(`Cursor Rules: ${colors.cyan(answers.addCursorRules ? 'Yes' : 'No')}`)

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
      console.log('\n❌ Project creation cancelled.')
      return
    }
  }
  console.log('\n🛠️ Creating your Motia project...\n')

  await create({
    projectName: answers.useCurrentFolder ? '.' : answers.folderName || '.',
    template: answers.template,
    cursorEnabled: answers.addCursorRules,
  })
}
