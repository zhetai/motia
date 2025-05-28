import colors from 'colors'
import { program } from 'commander'
import { build } from '../build'
import { CliContext, handler } from '../config-utils'

program
  .command('build')
  .description('Build the project')
  .action(
    handler(async (_: unknown, context: CliContext) => {
      await build(context)
      console.log(colors.green('✓ [SUCCESS]'), 'Build completed')
    }),
  )
