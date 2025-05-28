export interface Environment {
  id: string
  name: string
  description?: string
  projectId: string
  apiGatewayUrl?: string
  apiGatewayDomain?: string
  currentVersion?: string
  status: 'creating' | 'completed' | 'live' | 'failed'
}
