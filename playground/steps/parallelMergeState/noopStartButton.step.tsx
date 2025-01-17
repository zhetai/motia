import React from 'react'
import { BaseNode, BaseNodeProps, Button } from '@motia/workbench'

export default (data: BaseNodeProps) => {
  const [count, setCount] = React.useState(0)

  function start() {
    fetch('/api/parallel-merge', {
      method: 'POST',
    })
  }

  return (
    <BaseNode variant={'noop'} {...data}>
      <div className="flex flex-row items-center gap-2">
        <Button onClick={() => fetch('/api/parallel-merge', { method: 'POST' })}>Start Flow</Button>
      </div>
    </BaseNode>
  )
}
