import { cloudCli } from '../cli'
import { handler } from '../config-utils'
import { createEnvironment, listEnvironments, selectEnvironment, updateEnvironment } from '../environment'

const environmentCommand = cloudCli.command('environment').description('Manage version environments')

environmentCommand
  .command('create')
  .alias('c')
  .alias('new')
  .description('Create a new version environment')
  .requiredOption(
    '-k, --api-key <api key>',
    'API key for authentication (not stored in config)',
    process.env.MOTIA_API_KEY,
  )
  .option('-n, --name <environment name>', 'The name for your version environment')
  .option('-d, --description <description>', 'Description of the version environment')
  .action(handler(createEnvironment))

environmentCommand
  .command('select')
  .alias('s')
  .description('Select a environment')
  .option('-n, --name <environment name>', 'The name of the environment to select')
  .requiredOption('-k, --api-key <api key>', 'API key for authentication', process.env.MOTIA_API_KEY)
  .action(handler(selectEnvironment))

environmentCommand
  .command('list')
  .alias('ls')
  .description('List all version environments')
  .requiredOption('-k, --api-key <api key>', 'API key for authentication', process.env.MOTIA_API_KEY)
  .action(handler(listEnvironments))

environmentCommand
  .command('update')
  .alias('u')
  .description('Update a environment to a specific version')
  .requiredOption('-k, --api-key <api key>', 'API key for authentication', process.env.MOTIA_API_KEY)
  .requiredOption('-v, --version-name <version>', 'The version to promote')
  .action(handler(updateEnvironment))
