import { ApiError } from '../../core/api-base'
import path from 'path'

export class VersionError extends ApiError {
  constructor(message: string, details?: string, code = 'VERSION_ERROR') {
    super({
      status: 500,
      message,
      details,
      code,
    })
    this.name = 'VersionError'
  }
}

export class FileUploadError extends VersionError {
  constructor(error: unknown, filePath: string) {
    const fileName = path.basename(filePath)
    const details = error instanceof Error ? error.message : String(error)
    super(`Unable to upload ${fileName}`, details, 'FILE_UPLOAD_ERROR')
    this.name = 'FileUploadError'
  }
}

export class InvalidConfigError extends VersionError {
  constructor(message = 'Invalid version configuration') {
    super(message, undefined, 'INVALID_CONFIG')
    this.name = 'InvalidConfigError'
  }
}

export class VersionPromotionError extends VersionError {
  constructor(version: string, environmentId: string, error?: Error) {
    const details = error instanceof ApiError ? error.message : error?.message
    super(`Unable to promote version ${version} to environment ${environmentId}`, details, 'VERSION_PROMOTION_ERROR')
    this.name = 'VersionPromotionError'
  }
}

export class VersionStartError extends VersionError {
  constructor(versionId: string, error?: Error) {
    const details = error instanceof ApiError ? error.message : error?.message
    super(`Unable to start version ${versionId}`, details, 'VERSION_START_ERROR')
    this.name = 'VersionStartError'
  }
}

export class VersionNotFoundError extends VersionError {
  constructor(versionId: string) {
    super(
      `Version ${versionId} not found`,
      'The specified version does not exist or has been deleted',
      'VERSION_NOT_FOUND',
    )
    this.name = 'VersionNotFoundError'
  }
}
