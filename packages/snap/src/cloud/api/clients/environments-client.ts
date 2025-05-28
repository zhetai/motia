import { HttpClient } from '../core/http-client'
import { Environment } from '../models/entities/environment'
import { ENDPOINTS } from '../core/api-constants'
import {
  DuplicateEnvironmentError,
  EnvironmentError,
  EnvironmentNotFoundError,
} from '../models/errors/environment-errors'
import { ApiError } from '../core/api-base'

export class EnvironmentsClient extends HttpClient {
  async createEnvironment(name: string, projectId: string, description?: string): Promise<Environment> {
    try {
      return await this.request<Environment>(`${ENDPOINTS.PROJECTS}/${projectId}/environments`, 'POST', {
        name,
        description,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new DuplicateEnvironmentError(name, projectId)
        }
        throw new EnvironmentError(
          'Unable to create environment',
          `${error.message}${error.details ? `\nDetails: ${error.details}` : ''}`,
          error.code,
        )
      }
      throw error
    }
  }

  async getEnvironments(projectId: string): Promise<Environment[]> {
    try {
      return await this.request<Environment[]>(`${ENDPOINTS.PROJECTS}/${projectId}/environments`)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new EnvironmentError(
          'Unable to retrieve environments',
          `${error.message}${error.details ? `\nDetails: ${error.details}` : ''}`,
          error.code,
        )
      }
      throw error
    }
  }

  async getEnvironment(projectId: string, environmentId: string): Promise<Environment> {
    try {
      return await this.request<Environment>(`${ENDPOINTS.PROJECTS}/${projectId}/environments/${environmentId}`)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new EnvironmentNotFoundError(environmentId)
        }
        throw new EnvironmentError(
          `Unable to retrieve environment ${environmentId}`,
          `${error.message}${error.details ? `\nDetails: ${error.details}` : ''}`,
          error.code,
        )
      }
      throw error
    }
  }

  async updateEnvironment(
    projectId: string,
    environmentId: string,
    data: { name?: string; description?: string },
  ): Promise<Environment> {
    try {
      return await this.request<Environment>(
        `${ENDPOINTS.PROJECTS}/${projectId}/environments/${environmentId}`,
        'PATCH',
        data,
      )
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new EnvironmentNotFoundError(environmentId)
        }
        if (error.status === 409) {
          throw new DuplicateEnvironmentError(data.name || '', projectId)
        }
        throw new EnvironmentError(
          `Unable to update environment ${environmentId}`,
          `${error.message}${error.details ? `\nDetails: ${error.details}` : ''}`,
          error.code,
        )
      }
      throw error
    }
  }

  async deleteEnvironment(projectId: string, environmentId: string): Promise<void> {
    try {
      return await this.request<void>(`${ENDPOINTS.PROJECTS}/${projectId}/environments/${environmentId}`, 'DELETE')
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new EnvironmentNotFoundError(environmentId)
        }
        throw new EnvironmentError(
          `Unable to delete environment ${environmentId}`,
          `${error.message}${error.details ? `\nDetails: ${error.details}` : ''}`,
          error.code,
        )
      }
      throw error
    }
  }
}
