/**
 * Type definitions for the version system
 */

/**
 * Configuration for a step
 */
export interface StepConfig {
  type: 'node' | 'python'
  entrypointPath: string
  config: { [key: string]: string }
}

/**
 * Configuration for all steps
 */
export interface StepsConfig {
  [bundlePath: string]: StepConfig
}

/**
 * Configuration for version
 */
export interface VersionConfig {
  apiKey: string
  environmentId: string
  version: string
}

/**
 * Result of a version operation
 */
export interface VersionResult {
  bundlePath: string
  versionId?: string
  stepPath?: string
  flowName: string
  environment: string
  version: string
  error?: string
  success: boolean
}

/**
 * Information about a zip file to be deployed
 */
export interface ZipFileInfo {
  zipPath: string
  bundlePath: string
  stepName: string
  config: StepConfig
}

/**
 * Summary of a version operation
 */
export interface VersionSummary {
  versionTime: string
  environment: string
  version: string
}

export interface UploadResult {
  bundlePath: string
  error?: string
  success: boolean
}
