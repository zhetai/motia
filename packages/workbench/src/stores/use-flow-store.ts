import { create } from 'zustand'
import { FlowConfigResponse, FlowResponse } from '@/views/flow/hooks/use-get-flow-state'
import { persist, createJSONStorage } from 'zustand/middleware'

type UseFlowStore = {
  selectedFlowId: string
  flows: Record<string, FlowResponse>
  flowConfigs: Record<string, FlowConfigResponse>
  addFlowConfig: (flowConfig: FlowConfigResponse) => void
  addFlow: (flow: FlowResponse) => void
  addFlowList: (flows: FlowResponse[]) => void
  selectFlowId: (flowId: string) => void
}

export const useFlowStore = create(
  persist<UseFlowStore>(
    (set) => ({
      selectedFlowId: '',
      flows: {},
      flowConfigs: {},
      addFlowConfig: (flowConfig: FlowConfigResponse) => {
        const flowId = flowConfig.id
        set((state) => {
          return { flowConfigs: { ...state.flowConfigs, [flowId]: flowConfig } }
        })
      },
      addFlowList: (flows: FlowResponse[]) => {
        set((state) => {
          const newFlows = flows.reduce(
            (acc, flow) => {
              if (state.flows[flow.id]) {
                return acc
              }
              acc[flow.id] = flow
              return acc
            },
            {} as Record<string, FlowResponse>,
          )
          return { flows: { ...state.flows, ...newFlows } }
        })
      },
      addFlow: (flow: FlowResponse) => {
        const flowId = flow.id as string
        set((state) => {
          return {
            flows: { ...state.flows, [flowId]: flow },
          }
        })
      },
      selectFlowId: (flowId) =>
        set((state) => {
          if (state.selectedFlowId === flowId) {
            return state
          }
          return { selectedFlowId: flowId }
        }),
    }),
    {
      name: 'motia-flow-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
