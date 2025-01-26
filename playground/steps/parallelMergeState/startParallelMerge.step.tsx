import React from 'react'
import { Button, ApiNode, ApiNodeProps } from '@motiadev/workbench'

export const Node: React.FC<ApiNodeProps> = ({ data }) => {
  const onClick = () => {
    fetch('/api/parallel-merge', {
      method: 'POST',
      body: JSON.stringify({ start: true }),
    })
  }

  return (
    <ApiNode data={{ ...data, description: undefined }}>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col items-center text-sm">{data.description}</div>
        <div className="flex flex-col items-end text-sm">
          <Button onClick={onClick}>Play</Button>
        </div>
      </div>
    </ApiNode>
  )
}
