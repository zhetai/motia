import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@motiadev/ui'
import { ChevronsUpDown, Workflow } from 'lucide-react'
import { useFlowStore } from '@/stores/use-flow-store'
import { useFetchFlows } from '@/hooks/use-fetch-flows'
import { useShallow } from 'zustand/react/shallow'

export const FlowTabMenuItem = () => {
  useFetchFlows()
  const selectFlowId = useFlowStore((state) => state.selectFlowId)
  const flows = useFlowStore(useShallow((state) => Object.values(state.flows)))
  const flow = useFlowStore((state) => state.flows[state.selectedFlowId])

  if (flows.length === 0) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex flex-row justify-center items-center gap-2 cursor-pointer">
            <Workflow />
            {flow?.name ?? 'No flow selected'}
            <ChevronsUpDown className="size-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background text-foreground">
          {flows.map((item) => (
            <DropdownMenuItem
              key={`dropdown-${item.name}`}
              className="cursor-pointer gap-2"
              onClick={() => selectFlowId(item.id)}
            >
              {item.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
