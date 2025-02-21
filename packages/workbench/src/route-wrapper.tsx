import React, { PropsWithChildren } from 'react'
import { AppSidebar } from './components/app-sidebar'
import { ReactFlowProvider } from '@xyflow/react'

export const RouteWrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="flex flex-row">
    <ReactFlowProvider>
      <AppSidebar />
      <div className="flex-1">{children}</div>
    </ReactFlowProvider>
  </div>
)
