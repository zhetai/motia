#!/usr/bin/env node
const { program } = require('commander')

require('dotenv/config')
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

program //
  .command('dev')
  .description('Start the development server')
  .action(async () => {
    const { dev } = require('./dev/wistro-dev')
    await dev()
  })

program.parse(process.argv)
