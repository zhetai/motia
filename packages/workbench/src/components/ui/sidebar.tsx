import React, { PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

export const Sidebar: React.FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>
}

export const SidebarGroup: React.FC<PropsWithChildren<{ title: string }>> = ({ children, title }) => {
  return (
    <div className="flex flex-col w-[250px]">
      <h2 className="text-lg text-white/60 px-4 py-2 uppercase">{title}</h2>
      {children}
    </div>
  )
}

type SidebarButtonProps = PropsWithChildren<{
  isActive: boolean
  icon: React.ReactNode
}>

export const SidebarButton: React.FC<SidebarButtonProps> = ({ children, isActive, icon }) => {
  return (
    <div className={cn('flex items-center gap-2 px-4 py-3 ', isActive && 'bg-[#242036]')}>
      <div className="text-gray-500">{icon}</div>
      {children}
    </div>
  )
}
