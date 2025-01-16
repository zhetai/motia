import React from 'react'
import { BaseHandle, BaseNodeProps, Position } from '@motia/workbench'

export default (_: BaseNodeProps) => {
  return (
    <div className="p-3 px-6 flex flex-col max-w-[300px] bg-black border-white rounded-full text-white border border-solid text-center text-sm">
      <div>Join Complete</div>
      <BaseHandle type="target" position={Position.Top} />
    </div>
  )
}
