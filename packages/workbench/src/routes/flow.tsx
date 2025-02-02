import { FlowView } from '@/views/flow/flow-view'
import { FlowResponse } from '@/views/flow/hooks/use-get-flow-state'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useFlowUpdateListener } from '../hooks/use-flow-update-listener'

export const Flow = () => {
  const { id } = useParams()
  const flowId = id!
  const [flow, setFlow] = useState<FlowResponse | null>(null)

  const fetchFlow = useCallback(() => {
    fetch(`/flows/${flowId}`)
      .then((res) => res.json())
      .then((flow) => setFlow(flow))
  }, [flowId])

  useEffect(fetchFlow, [fetchFlow])
  useFlowUpdateListener(flowId, fetchFlow)

  if (!flow) return null

  return (
    <div className="w-screen h-screen">
      <FlowView flow={flow} />
    </div>
  )
}
