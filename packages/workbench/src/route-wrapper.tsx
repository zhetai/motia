import React, { PropsWithChildren } from 'react'
import { AppSidebar } from './components/app-sidebar'
import { SidebarProvider } from './components/ui/sidebar'

export const RouteWrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <SidebarProvider>
    <AppSidebar />
    {children}
  </SidebarProvider>
)
