import { useLogs } from '@/stores/use-logs'
import { Badge } from './badge'
import React from 'react'

interface BadgeCountProps {
  className?: string
  dotOnly?: boolean
}

export const BadgeCount: React.FC<BadgeCountProps> = ({ className, dotOnly = false }) => {
  const unreadLogsCount = useLogs((state) => state.unreadLogsCount)

  if (!unreadLogsCount) {
    return null
  }

  if (dotOnly) {
    return <Badge variant="red-dot" className={className} />
  }

  return (
    <Badge variant="red-rounded" className={className}>
      {unreadLogsCount}
    </Badge>
  )
}
