import { useListFlows } from '@/hooks/use-list-flows'
import { File, Link2, Logs, Workflow } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { Sidebar, SidebarButton, SidebarGroup } from './ui/sidebar'
import { Badge } from './ui/badge'
import { useLogs } from '@/stores/use-logs'

const BadgeCount = () => {
  const unreadLogsCount = useLogs((state) => state.unreadLogsCount)

  if (!unreadLogsCount) {
    return null
  }

  return <Badge variant="red-rounded">{unreadLogsCount}</Badge>
}

export const AppSidebar = () => {
  const { flows } = useListFlows()
  const { pathname } = useLocation()
  const isActive = (flowId: string) => pathname.includes(`/flow/${flowId}`)

  return (
    <Sidebar>
      <SidebarGroup testId="motia-title" title="Motia">
        <Link data-testid="logs-link" to="/logs">
          <SidebarButton isActive={pathname === '/logs'} icon={<Logs className="w-4 h-4" />}>
            Logs
            {pathname !== '/logs' && <BadgeCount />}
          </SidebarButton>
        </Link>
        <Link data-testid="states-link" to="/states">
          <SidebarButton isActive={pathname === '/states'} icon={<File className="w-4 h-4" />}>
            States
          </SidebarButton>
        </Link>
        <Link data-testid="endpoints-link" to="/endpoints">
          <SidebarButton isActive={pathname === '/endpoints'} icon={<Link2 className="w-4 h-4" />}>
            Endpoints
          </SidebarButton>
        </Link>
      </SidebarGroup>
      <SidebarGroup testId="flows-title" title="Flows">
        {flows.map((flow) => (
          <Link data-testid={`flow-${flow.name}-link`} to={`/flow/${flow.id}`} key={flow.id}>
            <SidebarButton isActive={isActive(flow.id)} icon={<Workflow className="w-4 h-4" />}>
              {flow.name}
            </SidebarButton>
          </Link>
        ))}
      </SidebarGroup>
    </Sidebar>
  )
}
