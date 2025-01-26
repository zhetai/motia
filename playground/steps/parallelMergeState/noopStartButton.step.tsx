import { BaseNode, Button, NoopNodeProps } from '@motiadev/workbench'
import React from 'react'

export const Node: React.FC<NoopNodeProps> = (data) => {
  const start = () => {
    fetch('/api/parallel-merge', { method: 'POST' })
  }

  return (
    <BaseNode title="Start" variant="noop" {...data} disableTargetHandle>
      <Button onClick={start}>Start Flow</Button>
    </BaseNode>
  )
}
