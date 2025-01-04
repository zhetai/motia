import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">Select a workflow</p>
    </div>
  )
}
