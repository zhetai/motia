import { AppSidebar } from './components/app-sidebar'
import { SidebarProvider } from './components/ui/sidebar'

export const RouteWrapper = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <AppSidebar />
    {children}
  </SidebarProvider>
)
