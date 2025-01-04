import { useEffect, useState } from 'react'

type Emit = string | { type: string; label?: string; conditional?: boolean }

type WorkflowStep = {
  id: string
  name: string
  type: 'base' | 'trigger'
  description?: string
  subscribes?: string[]
  emits: Emit[]
  action?: 'webhook' | 'cron'
  webhookUrl?: string
  cron?: string
}

type WorkflowResponse = {
  id: string
  name: string
  steps: WorkflowStep[]
}

export const useGetWorkflow = (id?: string) => {
  const [isLoading, setIsLoading] = useState(true)
  const [workflow, setWorkflow] = useState<WorkflowResponse>()

  useEffect(() => {
    if (!id) return
    
    fetch(`http://localhost:3000/workflows/${id}`) // TODO add env
      .then((res) => res.json())
      .then(setWorkflow)
      .finally(() => setIsLoading(false))
  }, [id])

  return { workflow, isLoading }
}
