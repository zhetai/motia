import { useListFlows } from '@/hooks/use-list-flows'
import { Workflow } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar'

export const AppSidebar = () => {
  const { flows } = useListFlows()
  const { pathname } = useLocation()
  const isActive = (flowId: string) => pathname.includes(`/flow/${flowId}`)

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Flows</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {flows.map((flow) => (
                <SidebarMenuItem key={flow.id}>
                  <SidebarMenuButton asChild className="cursor-pointer" isActive={isActive(flow.id)}>
                    <Link
                      to={`/flow/${flow.id}`}
                      className="flex items-center gap-2"
                      data-testid={`flow-link-${flow.id}`}
                    >
                      <Workflow />
                      <span>{flow.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
