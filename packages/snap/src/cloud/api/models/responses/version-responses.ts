export interface VersionStartResponse {
  message: string
  versionId: string
  clientId: string
  version: string
  status: string
  apiGatewayUrl: string
  apiGatewayDomain?: string
}

export interface VersionStatusResponse {
  status: string
  output?: string
  errorMessage?: string
}

export interface VersionListResponse {
  versions: Array<{
    id: string
    version: string
    status: string
    createdAt: string
    updatedAt: string
  }>
}
