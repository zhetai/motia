export interface CreateVersionRequest {
  environmentId: string
  version: string
  config: Record<string, unknown>
}

export interface UpdateVersionRequest {
  status?: string
  output?: string
  errorMessage?: string
}

export interface PromoteVersionRequest {
  targetEnvironmentId: string
  version: string
}
