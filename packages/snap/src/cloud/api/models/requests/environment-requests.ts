export interface CreateEnvironmentRequest {
  name: string
  description?: string
  projectId: string
  apiUrl?: string
}

export interface UpdateEnvironmentRequest {
  name?: string
  description?: string
  apiUrl?: string
}
