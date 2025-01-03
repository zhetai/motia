import { useEffect, useState } from 'react'

type Workflow = {
  id: string
  name: string
}

export const useListWorkflows = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [workflows, setWorkflows] = useState<Workflow[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/workflows') // TODO add env
      .then((res) => res.json())
      .then(setWorkflows)
      .finally(() => setIsLoading(false))
  }, [])

  return { workflows, isLoading }
}
