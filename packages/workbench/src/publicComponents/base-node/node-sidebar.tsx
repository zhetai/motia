import { JsonEditor } from '@/components/endpoints/json-editor'
import { Sidebar } from '@/components/sidebar/sidebar'
import { X } from 'lucide-react'
import React from 'react'
import { LanguageIndicator } from './language-indicator'

type NodeSidebarProps = {
  content: string
  title: string
  subtitle?: string
  variant: 'event' | 'api' | 'noop' | 'cron'
  language?: string
  isOpen: boolean
  onClose: () => void
}

export const NodeSidebar: React.FC<NodeSidebarProps> = ({ content, title, subtitle, language, isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <Sidebar
      title={title}
      subtitle={subtitle}
      initialWidth={600}
      contentClassName="p-0 h-full gap-0"
      onClose={onClose}
      actions={[{ icon: <X />, onClick: onClose, label: 'Close' }]}
    >
      <div className="flex items-center py-2 px-5 dark:bg-[#1e1e1e] gap-2 justify-center">
        <div className="text-sm text-muted-foreground">Read only</div>
        <div className="flex-1" />
        <LanguageIndicator language={language} className="w-4 h-4" size={16} showLabel />
      </div>
      <JsonEditor value={content} language={language} height={'calc(100vh - 160px)'} readOnly />
    </Sidebar>
  )
}
