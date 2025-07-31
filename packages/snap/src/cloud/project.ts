import { CliHandler, ProjectConfig, question, writeConfig } from './config-utils'
import { CliError } from './api/core/cli-error'

export const initProject: CliHandler = async (options, context): Promise<void> => {
  context.log('init', (message) => message.tag('progress').append('Initializing Motia Cloud project'))

  if (options.projectId) {
    context.log('init', (message) => message.tag('progress').append('Fetching project details'))

    const projectsClient = context.apiFactory.getProjectsClient()
    const projects = await projectsClient.getProjects()
    const project = projects.find((project) => project.id === options.projectId)

    if (!project) {
      context.log('init', (message) => message.tag('failed').append('Project not found'))

      throw new CliError('Project not found')
    }

    context.log('init', (message) =>
      message.tag('success').append('Project').append(project.name, 'dark').append('found'),
    )

    const config: ProjectConfig = {
      name: project.name,
      description: project.description,
      id: project.id,
      selectedEnvironment: undefined,
    }

    context.log('config', (message) => message.tag('progress').append('Writing config file'))
    writeConfig(config)
    context.log('config', (message) => message.tag('success').append('Config file written'))
  } else {
    await createProject(options, context)
  }

  context.log('init', (message) => message.tag('success').append('Motia Cloud project initialized'))
}

export const createProject: CliHandler = async (options, context): Promise<void> => {
  const projectName = options.name || (await question('Project name: '))
  const projectDescription = options.description || (await question('Project description (optional): '))

  if (!projectName) {
    context.exitWithError('Project name is required')
  }

  context.log('create-project', (message) =>
    message.tag('progress').append(`Creating project "${projectName}" via API...`),
  )

  const existingConfig = context.config

  if (existingConfig) {
    const overwrite = await question('motia.config.json already exists. Overwrite? (y/N): ')

    if (overwrite.toLowerCase() !== 'y') {
      context.log('create-project', (message) =>
        message.tag('warning').append('Project creation cancelled at config write step'),
      )
      return
    }
  }

  const projectsClient = context.apiFactory.getProjectsClient()
  const projectData = await projectsClient.createProject(projectName, projectDescription)

  const config: ProjectConfig = {
    name: projectName,
    description: projectDescription || undefined,
    id: projectData.id,
    selectedEnvironment: existingConfig?.selectedEnvironment || undefined,
  }

  if (writeConfig(config)) {
    context.log('create-project', (message) =>
      message
        .tag('success')
        .append('Project')
        .append(projectName, 'dark')
        .append('created successfully with ID:')
        .append(projectData.id, 'dark'),
    )

    context.log('next-steps', (message) =>
      message
        .tag('info')
        .append('Next steps:')
        .append('\n  1. Create a environment with: motia cloud environment create')
        .append('\n     motia cloud environment create -n <environment-name> -k <api-key>'),
    )

    context.log('api-key', (message) =>
      message.box([
        'API key is not stored in the config for security reasons.',
        'You will need to provide it when running commands that require authentication',
      ]),
    )
  }
}
