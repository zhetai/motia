export const API_BASE_URL = process.env.MOTIACLOUD_API_BASE_URL || 'https://motia-hub-api.motiahub.com'

export const ENDPOINTS = {
  PROJECTS: '/projects',
  ENVIRONMENTS: '/environments',
  VERSIONS: '/versions',
}

export const MAX_UPLOAD_SIZE = 1000 * 1024 * 1024 // 1 GB
export const DEFAULT_TIMEOUT = 30000 // 30 seconds
