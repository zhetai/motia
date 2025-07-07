import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@motiadev/ui'
import { ChevronsUpDown, Workflow } from 'lucide-react'
import { useFlowStore } from '@/stores/use-flow-store'
import { useFetchFlows } from '@/hooks/use-fetch-flows'

export const FlowTabMenuItem = () => {
  useFetchFlows()

  const selectFlowId = useFlowStore((state) => state.selectFlowId)
  const flows = useFlowStore((state) => state.flows)
  const selectedFlowId = useFlowStore((state) => state.selectedFlowId)

  if (flows.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-row justify-center items-center gap-2 cursor-pointer">
          <Workflow />
          {selectedFlowId ?? 'No flow selected'}
          <ChevronsUpDown className="size-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background text-foreground">
        {flows.map((item) => (
          <DropdownMenuItem
            key={`dropdown-${item}`}
            className="cursor-pointer gap-2"
            onClick={() => selectFlowId(item)}
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
