import { ApiError } from '../core/api-base'
import { ENDPOINTS } from '../core/api-constants'
import { HttpClient } from '../core/http-client'
import { LogRecord } from '../models/entities/logs'
import { EnvironmentError, EnvironmentNotFoundError } from '../models/errors/environment-errors'

export class LogsClient extends HttpClient {
  async list(projectId: string, environmentId: string): Promise<LogRecord[]> {
    try {
      return await this.request<LogRecord[]>(`${ENDPOINTS.PROJECTS}/${projectId}/environments/${environmentId}/logs`)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new EnvironmentNotFoundError(environmentId)
        }
        throw new EnvironmentError(
          `Unable to get logs for environment ${environmentId}`,
          `${error.message}${error.details ? `\nDetails: ${error.details}` : ''}`,
          error.code,
        )
      }
      throw error
    }
  }
}
