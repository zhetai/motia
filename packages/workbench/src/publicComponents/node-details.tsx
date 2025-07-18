import { ChevronRight, X } from 'lucide-react'
import React, { PropsWithChildren, useCallback, useState } from 'react'
import { Sidebar } from '@/components/sidebar/sidebar'
import { Label } from '@motiadev/ui'
import { LanguageIndicator } from '@/publicComponents/base-node/language-indicator'
import { Subscribe } from './base-node/subscribe'
import { Emits } from './base-node/emits'

type Props = PropsWithChildren<{
  name: string
  type: 'event' | 'api' | 'noop' | 'cron'
  subscribes?: string[]
  emits?: Array<string | { topic: string; label?: string }>
  description?: string
  language?: string
}>

export const DetailItem: React.FC<PropsWithChildren<{ label: string }>> = (props) => {
  const { label, children } = props

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-foreground">{label}</Label>
      {children}
    </div>
  )
}
export const NodeDetails: React.FC<Props> = (props) => {
  const { name, type, subscribes, emits, description, language, children } = props
  const [isOpen, setIsOpen] = useState(false)

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <>
      <div className="flex justify-end gap-2">
        <div
          className="border border-solid border-border/50 p-1 rounded-md cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
      {isOpen && (
        <Sidebar
          onClose={onClose}
          title={name}
          subtitle={description}
          actions={[{ icon: <X />, onClick: onClose, label: 'Close' }]}
          details={[
            { label: 'Type', value: <div className="capitalize flex gap-2 items-center">{type}</div> },
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
          ].filter((a) => !!a)}
        >
          {children}
        </Sidebar>
      )}
    </>
  )
}
