export const STEP_TYPES = ['api', 'event', 'cron', 'noop'] as const
export const LANGUAGES = ['typescript', 'javascript', 'python', 'ruby'] as const
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const

export type StepType = (typeof STEP_TYPES)[number]
export type Language = (typeof LANGUAGES)[number]
export type HttpMethod = (typeof HTTP_METHODS)[number]

export type StepAnswers = {
  // Basic info
  name: string
  language: Language
  type: StepType
  description?: string

  // API specific
  method?: HttpMethod
  path?: string

  // Event specific
  subscriptions?: string[]

  // Cron specific
  cronExpression?: string

  // Noop specific
  virtualEmits?: string[]
  virtualSubscribes?: string[]

  // Common
  emits: string[]
  flows: string[]
  createOverride: boolean
}
