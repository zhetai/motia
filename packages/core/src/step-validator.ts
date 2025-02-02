import { z } from 'zod'
import { Step } from './types'

const emits = z.array(
  z.union([
    z.string(),
    z
      .object({
        type: z.string(),
        label: z.string().optional(),
        conditional: z.boolean().optional(),
      })
      .strict(),
  ]),
)

const noopSchema = z
  .object({
    type: z.literal('noop'),
    name: z.string(),
    description: z.string().optional(),
    virtualEmits: emits,
    virtualSubscribes: z.array(z.string()),
    flows: z.array(z.string()).optional(),
  })
  .strict()

const eventSchema = z
  .object({
    type: z.literal('event'),
    name: z.string(),
    description: z.string().optional(),
    subscribes: z.array(z.string()),
    emits: emits,
    virtualEmits: emits.optional(),
    input: z.any(),
    flows: z.array(z.string()).optional(),
  })
  .strict()

const apiSchema = z
  .object({
    type: z.literal('api'),
    name: z.string(),
    description: z.string().optional(),
    path: z.string(),
    method: z.string(),
    emits: emits,
    virtualEmits: emits.optional(),
    virtualSubscribes: z.array(z.string()).optional(),
    flows: z.array(z.string()).optional(),
    bodySchema: z.instanceof(z.ZodObject).optional(),
  })
  .strict()

const cronSchema = z
  .object({
    type: z.literal('cron'),
    name: z.string(),
    description: z.string().optional(),
    cron: z.string(),
    virtualEmits: emits.optional(),
    emits: emits,
    flows: z.array(z.string()).optional(),
  })
  .strict()

export type ValidationSuccess = {
  success: true
}

export type ValidationError = {
  success: false
  error: string
  errors?: Array<{ path: string; message: string }>
}

export type ValidationResult = ValidationSuccess | ValidationError

export const validateStep = (step: Step): ValidationResult => {
  try {
    if (step.config.type === 'noop') {
      noopSchema.parse(step.config)
    } else if (step.config.type === 'event') {
      eventSchema.parse(step.config)
    } else if (step.config.type === 'api') {
      apiSchema.parse(step.config)
    } else if (step.config.type === 'cron') {
      cronSchema.parse(step.config)
    } else {
      return {
        success: false,
        error: 'Invalid step type',
      }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid step configuration',
        errors: error.errors.map((err) => ({ path: err.path.join('.'), message: err.message })),
      }
    }

    // Handle unexpected errors
    return {
      success: false,
      error: 'Unexpected validation error occurred',
    }
  }
}
