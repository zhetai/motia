import { useFlowStore } from '@/stores/use-flow-store'
import { FlowConfigResponse, FlowResponse } from '@/views/flow/hooks/use-get-flow-state'
import { useStreamGroup, useStreamItem } from '@motiadev/stream-client-react'
import { useEffect } from 'react'

export const useFetchFlows = () => {
  const addFlow = useFlowStore((state) => state.addFlow)
  const addFlowList = useFlowStore((state) => state.addFlowList)
  const addFlowConfig = useFlowStore((state) => state.addFlowConfig)
  const flowId = useFlowStore((state) => state.selectedFlowId)
  const selectFlowId = useFlowStore((state) => state.selectFlowId)

  const { data: flow } = useStreamItem<FlowResponse>({
    streamName: '__motia.flows',
    groupId: 'default',
    id: flowId,
  })

  const { data: flowConfig } = useStreamItem<FlowConfigResponse>({
    streamName: '__motia.flowsConfig',
    groupId: 'default',
    id: flowId,
  })

  const { data: flows } = useStreamGroup<FlowResponse>({
    streamName: '__motia.flows',
    groupId: 'default',
  })

  useEffect(() => {
    if (flows) {
      addFlowList(flows)
    }
  }, [flows, addFlowList])

  useEffect(() => {
    if (!flowId && flows.length > 0) {
      selectFlowId(flows[0].id)
    }
  }, [flows, flowId, selectFlowId])

  useEffect(() => {
    if (flow) {
      addFlow(flow)
    }
  }, [flow, addFlow])

  useEffect(() => {
    if (flowConfig) {
      addFlowConfig(flowConfig)
    }
  }, [flowConfig, addFlowConfig])
}
