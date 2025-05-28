import { CliContext, handler } from '../config-utils'
import { cloudCli } from '../cli'

const projectCommand = cloudCli.command('project').description('Manage projects')

export async function listProjects(context: CliContext): Promise<void> {
  try {
    context.log('list-projects', (message) => message.tag('progress').append('Fetching projects...'))

    try {
      const projectsClient = context.apiFactory.getProjectsClient()
      const projects = await projectsClient.getProjects()

      if (projects.length === 0) {
        context.log('list-projects', (message) => message.tag('warning').append('No projects found.'))
        context.exit(0)
      }

      context.log('list-projects', (message) => message.tag('success').append(`${projects.length} projects found`))
      context.log('', (message) =>
        message.table(
          ['Name', 'ID', 'Description'],
          projects.map((project) => [project.name, project.id, project.description || '']),
        ),
      )
    } catch (error) {
      context.exitWithError('Failed to list projects', error)
    }
  } catch (error) {
    context.exitWithError('Failed to list projects', error)
  }

  context.exit(0)
}

projectCommand
  .command('list')
  .alias('ls')
  .description('List all projects')
  .requiredOption(
    '-k, --api-key <api key>',
    'API key for authentication (not stored in config)',
    process.env.MOTIA_API_KEY,
  )
  .action(handler((_, context) => listProjects(context)))
