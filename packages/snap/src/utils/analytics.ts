import { add, Identify, identify, init, setOptOut, Types } from '@amplitude/analytics-node'
import { MotiaEnrichmentPlugin } from './amplitude/enrichment-plugin'
import { getProjectIdentifier, isAnalyticsEnabled, getUserIdentifier } from '@motiadev/core'

init('ab2408031a38aa5cb85587a27ecfc69c', {
  logLevel: Types.LogLevel.None,
})

const updateOptOutStatus = () => {
  const optOut = !isAnalyticsEnabled()
  setOptOut(optOut)
}

updateOptOutStatus()

add(new MotiaEnrichmentPlugin())

export const enableAnalytics = () => {
  setOptOut(false)
}

export const disableAnalytics = () => {
  setOptOut(true)
}

export const identifyUser = () => {
  try {
    const identifyObj = new Identify()
    identifyObj.postInsert('project_id', getProjectIdentifier(process.cwd()))
    identifyObj.postInsert('motia_version', process.env.npm_package_dependencies_motia || 'unknown')
    identifyObj.postInsert('project_version', process.env.npm_package_version || 'unknown')
    identify(identifyObj, {
      user_id: getUserIdentifier(),
    })
  } catch (error) {
    // Silently fail
  }
}
