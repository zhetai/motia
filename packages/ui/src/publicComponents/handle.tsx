import { Position } from '@xyflow/react'
import React from 'react'
import { BaseHandle } from '../views/flow/base-handle'

export const Handle: React.FC = () => {
  return <BaseHandle type="target" position={Position.Top} />
}
