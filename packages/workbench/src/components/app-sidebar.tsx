import { useListFlows } from '@/hooks/use-list-flows'
import { File, Link2, Logs, Workflow, GanttChartIcon } from 'lucide-react'
import { Sidebar, SidebarButton, SidebarGroup } from './ui/sidebar'

export const AppSidebar = () => {
  const { flows } = useListFlows()
  const pathname = ''
  const isActive = (flowId: string) => pathname.includes(`/flow/${flowId}`)

  return (
    <Sidebar>
      <SidebarGroup testId="motia-title" title="Motia">
        <a data-testid="logs-link" href="/logs">
          <SidebarButton icon={<Logs className="w-4 h-4" />} isActive={false}>
            Logs
          </SidebarButton>
        </a>
        <a data-testid="traces-link" href="/traces">
          <SidebarButton icon={<GanttChartIcon className="w-4 h-4" />} isActive={false}>
            Traces
          </SidebarButton>
        </a>
        <a data-testid="states-link" href="/states">
          <SidebarButton icon={<File className="w-4 h-4" />} isActive={false}>
            States
          </SidebarButton>
        </a>
        <a data-testid="endpoints-link" href="/endpoints">
          <SidebarButton icon={<Link2 className="w-4 h-4" />} isActive={false}>
            Endpoints
          </SidebarButton>
        </a>
      </SidebarGroup>
      <SidebarGroup testId="flows-title" title="Flows">
        {flows.map((flow) => (
          <a data-testid={`flow-${flow.name}-link`} href={`/flow/${flow.id}`} key={flow.id}>
            <SidebarButton isActive={isActive(flow.id)} icon={<Workflow className="w-4 h-4" />}>
              {flow.name}
            </SidebarButton>
          </a>
        ))}
      </SidebarGroup>
    </Sidebar>
  )
}
