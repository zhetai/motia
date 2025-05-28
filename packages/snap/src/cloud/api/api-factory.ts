import { API_BASE_URL } from './core/api-constants'
import { ProjectsClient } from './clients/projects-client'
import { EnvironmentsClient } from './clients/environments-client'
import { VersionsClient } from './clients/versions-client'
import { LogsClient } from './clients/logs-client'

export class ApiFactory {
  private readonly apiKey: string
  private readonly baseUrl: string

  private projectsClient?: ProjectsClient
  private environmentsClient?: EnvironmentsClient
  private versionsClient?: VersionsClient
  private logsClient?: LogsClient

  constructor(apiKey: string, baseUrl: string = API_BASE_URL) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  public getProjectsClient(): ProjectsClient {
    if (!this.projectsClient) {
      this.projectsClient = new ProjectsClient(this.apiKey, this.baseUrl)
    }
    return this.projectsClient
  }

  public getEnvironmentsClient(): EnvironmentsClient {
    if (!this.environmentsClient) {
      this.environmentsClient = new EnvironmentsClient(this.apiKey, this.baseUrl)
    }
    return this.environmentsClient
  }

  public getLogsClient(): LogsClient {
    if (!this.logsClient) {
      this.logsClient = new LogsClient(this.apiKey, this.baseUrl)
    }
    return this.logsClient
  }

  public getVersionsClient(): VersionsClient {
    if (!this.versionsClient) {
      this.versionsClient = new VersionsClient(this.apiKey, this.baseUrl)
    }
    return this.versionsClient
  }
}
