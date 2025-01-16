import React from 'react'
import { BaseNode, BaseNodeProps, Button } from '@motia/workbench'

export default (data: BaseNodeProps) => {
  const [count, setCount] = React.useState(0)

  return (
    <BaseNode {...data}>
      <div className="flex flex-row items-center gap-2">
        <Button onClick={() => setCount(count + 1)}>Increment count</Button>
        <div className="text-white/60 text-sm">Count: {count}</div>
      </div>
    </BaseNode>
  )
}
