import React from 'react'
import { useListFlows } from '@/hooks/use-list-flows'
import { useFlow } from '@/hooks/use-flow'
import { Workflow } from 'lucide-react'
import { Breadcrumb as UIBreadcrumb } from '@motiadev/ui'

export const Breadcrumb: React.FC = () => {
  const { flows } = useListFlows()
  const { selectFlow, currentFlow } = useFlow()

  return (
    <UIBreadcrumb
      items={[
        {
          label: 'Flows',
        },
        {
          label: currentFlow?.name,
          dropdownItems: flows?.map((flow) => ({
            label: flow.name,
            icon: <Workflow className="size-4" />,
            onClick: () => selectFlow(flow),
          })),
        },
      ]}
    />
  )
}
