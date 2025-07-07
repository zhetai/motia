import { useHandlePositions } from '@/hooks/use-update-handle-positions'
import { PanelDetailItem } from '@motiadev/ui'
import { ChevronUp } from 'lucide-react'
import React, { PropsWithChildren, useState } from 'react'
import { BaseNodeProps } from '../node-props'
import { BaseHandle } from './base-handle'
import { LanguageIndicator } from './language-indicator'
import { NodeHeader } from './node-header'
import { NodeSidebar } from './node-sidebar'

type Props = PropsWithChildren<{
  title: string
  subtitle?: string
  variant: 'event' | 'api' | 'noop' | 'cron'
  language?: string
  className?: string
  disableSourceHandle?: boolean
  disableTargetHandle?: boolean
  details?: PanelDetailItem[]
  emits?: Array<string | { topic: string; label?: string }>
  subscribes?: string[]
  data: BaseNodeProps
}>

export const BaseNode: React.FC<Props> = ({
  title,
  variant,
  children,
  disableSourceHandle,
  disableTargetHandle,
  language,
  subtitle,
  details,
  subscribes,
  emits,
  data,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { sourcePosition, targetPosition, toggleTargetPosition, toggleSourcePosition } = useHandlePositions(data)

  return (
    <div className="p-[1px] rounded-lg max-w-[350px]">
      <div
        className="rounded-lg bg-background border-2 border-muted border-solid border-muted-foreground/10"
        data-testid={`node-${title?.toLowerCase().replace(/ /g, '-')}`}
      >
        <div className="group relative">
          {/* Main node content */}
          <NodeHeader text={title} variant={variant} subtitle={subtitle}>
            <LanguageIndicator language={language} />
            <div className="flex justify-end gap-2">
              <div
                className="p-[2px] cursor-pointer rounded-md hover:bg-muted-foreground/10"
                onClick={() => setIsOpen(true)}
              >
                <ChevronUp className="w-4 h-4" />
              </div>
            </div>
          </NodeHeader>
          {children && <div className="border-t-2 border-muted-foreground/10 p-4 space-y-3">{children}</div>}

          {/* Connection points */}
          {!disableTargetHandle && (
            <BaseHandle
              type="target"
              position={targetPosition}
              variant={variant}
              onTogglePosition={toggleTargetPosition}
            />
          )}
          {!disableSourceHandle && (
            <BaseHandle
              type="source"
              position={sourcePosition}
              variant={variant}
              onTogglePosition={toggleSourcePosition}
            />
          )}
        </div>
      </div>

      <NodeSidebar
        title={title}
        subtitle={subtitle}
        variant={variant}
        language={language}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        details={details}
        subscribes={subscribes}
        emits={emits}
      />
    </div>
  )
}
