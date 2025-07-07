import { FlowView } from '@/views/flow/flow-view'
import { useFlowStore } from '@/stores/use-flow-store'
import { useStreamItem } from '@motiadev/stream-client-react'
import { FlowConfigResponse, FlowResponse } from '../views/flow/hooks/use-get-flow-state'

export const Flow = () => {
  const selectedFlowId = useFlowStore((state) => state.selectedFlowId)
  const { data: flow } = useStreamItem<FlowResponse>({
    streamName: '__motia.flows',
    groupId: 'default',
    id: selectedFlowId ?? '',
  })

  const { data: flowConfig } = useStreamItem<FlowConfigResponse>({
    streamName: '__motia.flowsConfig',
    groupId: 'default',
    id: selectedFlowId ?? '',
  })

  if (!flow || flow.error)
    return (
      <div className="w-full h-full bg-background flex flex-col items-center justify-center">
        <p>{flow?.error}</p>
      </div>
    )

  return <FlowView flow={flow} flowConfig={flowConfig!} />
}
