import { generateDefaultTemplateSteps } from './default/generate'

export const templates: Record<string, (dir: string) => Promise<void>> = {
  default: generateDefaultTemplateSteps,
}
