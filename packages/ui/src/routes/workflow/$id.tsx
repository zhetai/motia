import { WorkflowView } from '@/views/workflow/workflow-view'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workflow/$id')({
  component: Workflow,
  loader: async ({ params }) => {
    return fetch(`/workflows/${params.id}`) // TODO add env
      .then((res) => res.json())
      .then((workflow) => ({ workflow }))
  },
})

function Workflow() {
  const { workflow } = Route.useLoaderData()

  return (
    <div className="w-screen h-screen">
      <WorkflowView workflow={workflow} />
    </div>
  )
}
