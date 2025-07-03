import { FlowView } from '@/views/flow/flow-view'
import { useFetchFlows } from '@/hooks/use-fetch-flows'
import { useFlow } from '@/hooks/use-flow'

export const Flow = () => {
  const { currentFlow } = useFlow()
  const { flow, flowConfig } = useFetchFlows(currentFlow?.id)

  if (!flow || flow.error)
    return (
      <div className="w-full h-full bg-background flex flex-col items-center justify-center">
        <p>{flow?.error}</p>
      </div>
    )

  return (
    <div className="w-full h-full bg-background">
      <FlowView flow={flow} flowConfig={flowConfig!} />
    </div>
  )
}
