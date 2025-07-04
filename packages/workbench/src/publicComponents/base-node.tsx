import { Position } from '@xyflow/react'
import React, { PropsWithChildren } from 'react'
import { LanguageIndicator } from '../views/flow/nodes/language-indicator'
import { BaseHandle } from './base-handle'
import { NodeHeader } from './base-node/node-header'

type Props = PropsWithChildren<{
  title: string
  subtitle?: string
  variant: 'event' | 'api' | 'noop' | 'cron'
  language?: string
  headerChildren?: React.ReactNode
  className?: string
  disableSourceHandle?: boolean
  disableTargetHandle?: boolean
}>

export const BaseNode = (props: Props) => {
  const { title, variant, children, disableSourceHandle, disableTargetHandle, language, subtitle } = props

  return (
    <div className="p-[1px] rounded-lg max-w-[350px]">
      <div
        className="rounded-lg bg-background border-2 border-muted border-solid border-muted-foreground/10"
        data-testid={`node-${title?.toLowerCase().replace(/ /g, '-')}`}
      >
        <div className="group relative">
          {/* Main node content */}
          <NodeHeader
            text={title}
            variant={variant}
            children={<LanguageIndicator language={language} />}
            subtitle={subtitle}
          />
          <div className="border-t-2 border-muted-foreground/10 p-4 space-y-3">{children}</div>

          {/* Connection points */}
          {!disableTargetHandle && <BaseHandle type="target" position={Position.Left} variant={variant} />}
          {!disableSourceHandle && <BaseHandle type="source" position={Position.Right} variant={variant} />}
        </div>
      </div>
    </div>
  )
}
