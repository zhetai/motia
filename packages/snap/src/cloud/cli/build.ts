import colors from 'colors'
import { program } from 'commander'
import { build } from '../build'
import { handler } from '../config-utils'

program
  .command('build')
  .description('Build the project')
  .action(
    handler(async () => {
      await build()
      console.log(colors.green('✓ [SUCCESS]'), 'Build completed')
    }),
  )
