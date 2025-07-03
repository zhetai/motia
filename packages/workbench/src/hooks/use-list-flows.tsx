import { useStreamGroup } from '@motiadev/stream-client-react'
import { FlowResponse } from '@/views/flow/hooks/use-get-flow-state'
import { useFlow } from '@/hooks/use-flow'
import { useEffect } from 'react'

export type Flow = {
  id: string
  name: string
  data?: FlowResponse
}

export const useListFlows = () => {
  const { data: flows } = useStreamGroup<Flow>({
    streamName: '__motia.flows',
    groupId: 'default',
  })

  const { selectFlow, currentFlow } = useFlow()

  useEffect(() => {
    if (!currentFlow) {
      selectFlow(flows[0])
    }
  }, [flows, currentFlow, selectFlow])

  return { flows }
}
