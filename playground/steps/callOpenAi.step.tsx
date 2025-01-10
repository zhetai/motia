import React from 'react'
import { BaseNodeData, BaseNode } from '@wistro/ui'

export default ({ data }: { data: BaseNodeData }) => {
  return <BaseNode variant="ghost" className="bg-black text-white border border-white border-solid" data={data} />
}
