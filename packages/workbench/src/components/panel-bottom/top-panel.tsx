import {
  CollapsiblePanel,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@motiadev/ui'
import { Endpoints } from '../endpoints/endpoints'
import { ReactFlowProvider } from '@xyflow/react'
import { Flow } from '@/routes/flow'
import { ChevronsUpDown, Link2, Workflow } from 'lucide-react'
import { useFlowStore } from '@/stores/use-flow-store'
import { useFetchFlows } from '@/hooks/use-fetch-flows'

const FlowTabMenu = () => {
  useFetchFlows()
  const selectFlowId = useFlowStore((state) => state.selectFlowId)
  const flows = useFlowStore((state) => state.flows)
  const flow = useFlowStore((state) => state.flows[state.selectedFlowId])

  if (Object.keys(flows).length === 0) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex flex-row justify-center items-center gap-2 cursor-pointer">
          <Workflow />
          {flow?.name ?? 'No flow selected'}
          <ChevronsUpDown className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className={'bg-background text-foreground'}>
          {Object.values(flows).map((item) => (
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

export const TopPanel = () => {
  return (
    <CollapsiblePanel
      id="top-panel"
      variant={'tabs'}
      defaultTab={'flow'}
      header={
        <TabsList>
          <TabsTrigger value="flow">
            <FlowTabMenu />
          </TabsTrigger>
          <TabsTrigger value="endpoint">
            <Link2 />
            Endpoint
          </TabsTrigger>
        </TabsList>
      }
    >
      <TabsContent value="flow" className="h-full" asChild>
        <ReactFlowProvider>
          <Flow />
        </ReactFlowProvider>
      </TabsContent>
      <TabsContent value="endpoint" asChild>
        <Endpoints />
      </TabsContent>
    </CollapsiblePanel>
  )
}
