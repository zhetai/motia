#!/usr/bin/env node
const { program } = require('commander')
const path = require('path')

require('dotenv/config')
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

program
  .command('dev')
  .description('Start the development server')
  .option('-d, --debug', 'Enable debug logging')
  .action(async (arg) => {
    if (arg.debug) {
      console.log('🔍 Debug logging enabled')
      process.env.LOG_LEVEL = 'debug'
    }

    const { dev } = require('./dev/wistro-dev')
    await dev()
  })

program
  .command('build')
  .description('Build the project')
  .option('-p', '--path', 'The root path where your steps and project config live')
  .action(async (arg) => {
    let projectDir = path.resolve(process.cwd())

    if (arg.path) {
      projectDir = path.resolve(arg.path)
    }

    const { generateLockFile } = require('./dev/generate-lock-file')

    console.log('🚀 Building project')
    await generateLockFile(projectDir)
    console.log('🎉 Project built successfully')
  })

program.parse(process.argv)
