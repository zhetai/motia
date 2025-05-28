import { AxiosError } from 'axios'
import { VersionError } from '../error'
import { CLIOutputManager } from '../../cli-output-manager'
import { ApiError } from '../../api'
import { readline } from '../../config-utils'

export const formatError = (error: unknown): string => {
  if (error instanceof VersionError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export const handleAxiosError = (error: AxiosError, operation: string): Error => {
  const errorCode = error.code || 'UNKNOWN'
  const statusCode = error.response?.status
  const responseData = error.response?.data ? JSON.stringify(error.response.data) : ''

  const errorMap: Record<string, string> = {
    ECONNREFUSED: 'Connection refused: Unable to connect to the API server',
    ENOTFOUND: 'Host not found: Please check your network connection and the API URL',
    ETIMEDOUT: 'Connection timed out: The server took too long to respond',
  }

  if (errorCode in errorMap) {
    return new Error(errorMap[errorCode])
  }

  if (statusCode) {
    if (statusCode === 401 || statusCode === 403) {
      return new Error(
        `Authentication error (${statusCode}): Invalid API key or insufficient permissions. ${responseData}`,
      )
    } else if (statusCode === 404) {
      return new Error(`Not found error (${statusCode}): The API endpoint was not found. ${responseData}`)
    } else if (statusCode === 413) {
      return new Error(
        `Payload too large (${statusCode}): The ${operation} exceeds the maximum allowed size. ${responseData}`,
      )
    } else if (statusCode >= 500) {
      return new Error(`Server error (${statusCode}): The API server encountered an error. ${responseData}`)
    } else {
      return new Error(`API request failed with status ${statusCode}: ${error.response?.statusText}. ${responseData}`)
    }
  }

  return new Error(`Request error during ${operation}: ${error.message}`)
}

export function handleApiError(error: unknown, output: CLIOutputManager, key: string, customMessage?: string): never {
  if ((error as ApiError).status) {
    const apiError = error as ApiError
    output.log(key, (message) => {
      message = message.tag('failed').append('API request failed').append(`${apiError.status}`, 'dark')

      message.box(
        [apiError.message, apiError.details].filter((detail): detail is string => !!detail),
        'red',
      )

      return message
    })
  } else {
    const errorMessage = error instanceof Error ? error.message : String(error)
    output.log(key, (message) =>
      message
        .tag('failed') //
        .append('API request failed')
        .append(errorMessage, 'red'),
    )
  }

  if (customMessage) {
    console.error(customMessage)
  }

  readline.close()
  process.exit(1)
}
