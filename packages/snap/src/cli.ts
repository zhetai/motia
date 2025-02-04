#!/usr/bin/env node
import { program } from 'commander'
import path from 'path'
import fs from 'fs'

const defaultPort = 3000

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv/config')
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

program
  .command('create')
  .description('Create a new motia project')
  .option(
    '-n, --name <project name>',
    'The name for your project, used to create a directory, use ./ or . to create it under the existing directory',
  )
  .option('-t, --template <template name>', 'The motia template name to use for your project')
  .action(async (arg) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { create } = require('./create')
    await create({
      projectName: arg.project ?? '.',
      template: arg.template ?? undefined,
    })
  })

program
  .command('templates')
  .description('Prints the list of available templates')
  .action(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { templates } = require('./create/templates')
    console.log(`📝 Available templates: \n\n ${Object.keys(templates).join('\n')}`)
  })

program
  .command('dev')
  .description('Start the development server')
  .option('-p, --port <port>', 'The port to run the server on', `${defaultPort}`)
  .option('-d, --debug', 'Enable debug logging')
  .action(async (arg) => {
    if (arg.debug) {
      console.log('🔍 Debug logging enabled')
      process.env.LOG_LEVEL = 'debug'
    }

    const port = arg.port ? parseInt(arg.port) : defaultPort
    const { dev } = require('./dev') // eslint-disable-line @typescript-eslint/no-require-imports
    await dev(port)
  })

program
  .command('get-config')
  .description('Get the generated config for your project')
  .option('-o, --output <port>', 'Path to write the generated config')
  .action(async (arg) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { generateLockedData } = require('./src/generate/locked-data')
    const lockedData = await generateLockedData(path.join(process.cwd()))

    if (arg.output) {
      const fs = require('fs') // eslint-disable-line @typescript-eslint/no-require-imports
      fs.writeFileSync(path.join(arg.output, '.motia.generated.json'), JSON.stringify(lockedData, null, 2))
      console.log(`📄 Wrote locked data to ${arg.output}`)

      return
    }
    console.log(JSON.stringify(lockedData, null, 2))
  })

program
  .command('emit')
  .description('Emit an event to the Motia server')
  .requiredOption('--topic <topic>', 'Event topic/type to emit')
  .requiredOption('--message <message>', 'Event payload as JSON string')
  .option('-p, --port <number>', 'Port number (default: 3000)')
  .action(async (options) => {
    const port = options.port || 3000
    const url = `http://localhost:${port}/emit`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: options.topic,
          data: JSON.parse(options.message),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Event emitted successfully:', result)
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  })

const state = program.command('state').description('Manage application state')

state
  .command('list')
  .description('List the current file state')
  .action(async () => {
    try {
      const statePath = path.join(process.cwd(), '.motia', 'motia.state.json')

      if (!fs.existsSync(statePath)) {
        console.error('Error: State file not found at', statePath)
        process.exit(1)
      }

      const state = require(statePath) // eslint-disable-line @typescript-eslint/no-require-imports
      console.log(JSON.stringify(state, null, 2))
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  })

program.parse(process.argv)
