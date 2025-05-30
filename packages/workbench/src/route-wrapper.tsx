import React, { PropsWithChildren } from 'react'
import { AppSidebar } from './components/app-sidebar'
import { ReactFlowProvider } from '@xyflow/react'
import { Header } from './components/header/header'

export const RouteWrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="flex flex-col bg-background text-foreground h-screen">
    <ReactFlowProvider>
      <Header />
      <div className="flex flex-row flex-1">
        <AppSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </ReactFlowProvider>
  </div>
)
