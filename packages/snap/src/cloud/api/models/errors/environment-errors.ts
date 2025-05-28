import { ApiError } from '../../core/api-base'

export class EnvironmentError extends ApiError {
  constructor(message: string, details?: string, code = 'ENVIRONMENT_ERROR') {
    super({
      status: 500,
      message,
      details,
      code,
    })
    this.name = 'EnvironmentError'
  }
}

export class EnvironmentNotFoundError extends EnvironmentError {
  constructor(environmentId: string) {
    super(
      `Environment ${environmentId} not found`,
      'The specified environment does not exist or has been deleted',
      'ENVIRONMENT_NOT_FOUND',
    )
    this.name = 'EnvironmentNotFoundError'
  }
}

export class DuplicateEnvironmentError extends EnvironmentError {
  constructor(environmentName: string, projectId: string) {
    super(
      `Environment with name "${environmentName}" already exists in project ${projectId}`,
      'Environment names must be unique within a project',
      'DUPLICATE_ENVIRONMENT',
    )
    this.name = 'DuplicateEnvironmentError'
  }
}
