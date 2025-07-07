import { FlowView } from '@/views/flow/flow-view'
import { useFlowStore } from '@/stores/use-flow-store'

export const Flow = () => {
  const flow = useFlowStore((state) => state.flows[state.selectedFlowId])
  const flowConfig = useFlowStore((state) => state.flowConfigs[state.selectedFlowId])

  if (!flow || flow.error)
    return (
      <div className="w-full h-full bg-background flex flex-col items-center justify-center">
        <p>{flow?.error}</p>
      </div>
    )

  return <FlowView flow={flow} flowConfig={flowConfig!} />
}
