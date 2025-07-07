import { Sidebar } from '@/components/sidebar/sidebar'
import { LanguageIndicator } from '@/publicComponents/base-node/language-indicator'
import { PanelDetailItem } from '@motiadev/ui'
import { X } from 'lucide-react'
import React from 'react'
import { Emits } from './emits'
import { Subscribe } from './subscribe'

type NodeSidebarProps = {
  title: string
  subtitle?: string
  variant: 'event' | 'api' | 'noop' | 'cron'
  language?: string
  isOpen: boolean
  onClose: () => void
  details?: PanelDetailItem[]
  subscribes?: string[]
  emits?: Array<string | { topic: string; label?: string }>
}

export const NodeSidebar: React.FC<NodeSidebarProps> = ({
  title,
  subtitle,
  variant,
  language,
  isOpen,
  onClose,
  details,
  subscribes,
  emits,
}) => {
  if (!isOpen) return null

  return (
    <Sidebar
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      actions={[{ icon: <X />, onClick: onClose, label: 'Close' }]}
      details={[
        { label: 'Type', value: <div className="capitalize flex gap-2 items-center">{variant}</div> },
        {
          label: 'Language',
          value: (
            <div className="capitalize flex gap-2 items-center">
              <LanguageIndicator language={language} />
              {language}
            </div>
          ),
        },
        subscribes ? { label: 'Subscribes', value: <Subscribe subscribes={subscribes} /> } : undefined,
        emits ? { label: 'Emits', value: <Emits emits={emits} /> } : undefined,
        ...(details ?? []),
      ].filter((item) => !!item)}
    />
  )
}
