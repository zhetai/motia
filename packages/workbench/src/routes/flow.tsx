import { FlowView } from '@/views/flow/flow-view'
import { FlowConfigResponse, FlowResponse } from '@/views/flow/hooks/use-get-flow-state'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useFlowUpdateListener } from '../hooks/use-flow-update-listener'

export const Flow = () => {
  const { id } = useParams()
  const flowId = id!
  const [flow, setFlow] = useState<FlowResponse | null>(null)
  const [flowConfig, setFlowConfig] = useState<FlowConfigResponse | null>(null)

  const fetchFlow = useCallback(() => {
    Promise.all([fetch(`/flows/${flowId}`), fetch(`/flows/${flowId}/config`)])
      .then(([flowRes, configRes]) => Promise.all([flowRes.json(), configRes.json()]))
      .then(([flow, config]) => {
        setFlow(flow)
        setFlowConfig(config)
      })
  }, [flowId])

  useEffect(fetchFlow, [fetchFlow])
  useFlowUpdateListener(flowId, fetchFlow)

  if (!flow) return null

  return (
    <div className="w-full h-screen">
      <FlowView flow={flow} flowConfig={flowConfig!} />
    </div>
  )
}
