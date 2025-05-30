import React, { PropsWithChildren } from 'react'
import { useLogListener } from '@/hooks/use-log-listener'

export const RootMotia: React.FC<PropsWithChildren> = ({ children }) => {
  useLogListener()

  return children
}
