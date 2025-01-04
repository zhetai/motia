import { z } from 'zod'
import { fallback, zodValidator } from '@tanstack/zod-adapter'
import { WorkflowView } from '@/views/workflow-view'
import { createFileRoute } from '@tanstack/react-router'

const searchSchema = z.object({
  workflowId: fallback(z.string(), '').default(''),
})

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: zodValidator(searchSchema),
})

function Index() {
  return (
    <div className="w-screen h-screen">
      <WorkflowView />
    </div>
  )
}
