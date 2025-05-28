import { cloudCli } from '../cli'
import { handler } from '../config-utils'
import { initProject } from '../project'

cloudCli
  .command('init')
  .description('Initialize a new Motia Cloud project')
  .requiredOption(
    '-k, --api-key <api key>',
    'API key for authentication (not stored in config)',
    process.env.MOTIA_API_KEY,
  )
  .option('-p, --project <project id>', 'The project id of an existing Motia Cloud project')
  .option('-n, --name <project name>', 'The name for your Motia Cloud project')
  .option('-d, --description <description>', 'Description of the Motia Cloud project')
  .action(handler(initProject))
