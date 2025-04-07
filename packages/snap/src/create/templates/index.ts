import { generateDefaultTemplateSteps } from './default/generate'
import { generatePythonTemplateSteps } from './python/generate'

export const templates: Record<string, (dir: string) => Promise<void>> = {
  default: generateDefaultTemplateSteps,
  python: generatePythonTemplateSteps,
}
