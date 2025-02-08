import React from 'react'
import { Badge, BadgeProps } from './ui/badge'

export const LogLevelBadge: React.FC<{ level: string; className?: string }> = (props) => {
  const map: Record<string, BadgeProps['variant']> = {
    info: 'info',
    error: 'error',
    warn: 'warning',
    debug: 'info',
  }

  return (
    <Badge variant={map[props.level] as BadgeProps['variant']} className={props.className}>
      {props.level}
    </Badge>
  )
}
