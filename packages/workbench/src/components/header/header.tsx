import React from 'react'
import { LogoIcon } from '../ui/logo-icon'
import { ThemeToggle } from '../ui/theme-toggle'
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb'

export const Header: React.FC = () => {
  return (
    <header className="min-h-16 px-4 gap-1 flex items-center bg-default text-default-foreground border-b">
      <LogoIcon className="h-8 w-8 mr-2" />
      <Breadcrumb />

      <div className="flex-1" />
      <ThemeToggle />
    </header>
  )
}
