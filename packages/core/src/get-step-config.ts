import { getNodeFileConfig } from './node/get-config'
import { getPythonConfig } from './python/get-python-config'
import { getRubyConfig } from './ruby/get-ruby-config'
import { StepConfig } from './types'

export const getStepConfig = async (filePath: string): Promise<StepConfig | null> => {
  const isRb = filePath.endsWith('.rb')
  const isPython = filePath.endsWith('.py')
  const isNode = filePath.endsWith('.js') || filePath.endsWith('.ts')

  if (isRb) {
    return getRubyConfig(filePath)
  } else if (isPython) {
    return getPythonConfig(filePath)
  } else if (isNode) {
    return getNodeFileConfig(filePath)
  }

  return null
}
