export type VersionStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export interface Version {
  id: string
  environmentId: string
  version: string
  status: VersionStatus
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
  errorMessage?: string
  output?: string
}

export interface VersionConfig {
  config: Record<string, unknown>
  version: string
}
