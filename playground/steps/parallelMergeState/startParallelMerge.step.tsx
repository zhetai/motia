import React from 'react'
import { Button, TriggerNode, TriggerNodeProps } from '@motiadev/workbench'

export default ({ data }: TriggerNodeProps) => {
  const onClick = () => {
    fetch('/api/parallel-merge', {
      method: 'POST',
      body: JSON.stringify({ start: true }),
    })
  }

  return (
    <TriggerNode data={{ ...data, description: undefined }} className="max-w-xs">
      <div className="flex flex-row gap-4">
        <div className="flex flex-col items-center text-sm">{data.description}</div>
        <div className="flex flex-col items-end text-sm">
          <Button onClick={onClick}>Play</Button>
        </div>
      </div>
    </TriggerNode>
  )
}
