import React, { PropsWithChildren } from 'react'
import { AppSidebar } from './components/app-sidebar'

export const RouteWrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="flex flex-row">
    <AppSidebar />
    <div className="flex-1">{children}</div>
  </div>
)
