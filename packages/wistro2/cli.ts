#!/usr/bin/env node
import 'dotenv/config'
import { program } from 'commander'
import { dev } from './dev/wistro-dev'

program //
  .command('dev')
  .description('Start the development server')
  .action(dev)

program.parse(process.argv)
