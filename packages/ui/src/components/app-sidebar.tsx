import { useListWorkflows } from '@/hooks/use-list-workflows'
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
import { Workflow } from 'lucide-react'
import { Link, useMatchRoute } from '@tanstack/react-router'

export const AppSidebar = () => {
  const { workflows } = useListWorkflows()
  const matchRoute = useMatchRoute()

  const isActive = (workflowId: string) => {
    return !!matchRoute({ to: '/workflow/$id', params: { id: workflowId } })
  }

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workflows</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflows.map((workflow) => (
                <SidebarMenuItem key={workflow.id}>
                  <SidebarMenuButton asChild className="cursor-pointer" isActive={isActive(workflow.id)}>
                    <Link
                      to="/workflow/$id"
                      params={{ id: workflow.id }}
                      className="flex items-center gap-2"
                      data-testid={workflow.id}
                    >
                      <Workflow />
                      <span>{workflow.name}</span>
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
