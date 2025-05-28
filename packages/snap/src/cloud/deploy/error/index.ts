export { VersionError } from './version-error'

export interface FailedUpload {
  path: string
  name: string
  type: string
  error: string
}
