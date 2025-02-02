import { useCallback, useEffect, useState } from 'react'
import { useFlowListener } from './use-flow-listener'

type Flow = {
  id: string
  name: string
}

export const useListFlows = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [flows, setFlows] = useState<Flow[]>([])

  const onFlowAdded = useCallback(
    (flowName: string) => {
      setFlows((prev) => [...prev, { id: flowName, name: flowName }])
    },
    [setFlows],
  )

  const onFlowRemoved = useCallback(
    (flowName: string) => {
      setFlows((prev) => prev.filter((flow) => flow.id !== flowName))
    },
    [setFlows],
  )

  useFlowListener({ onFlowAdded, onFlowRemoved })

  useEffect(() => {
    fetch('/flows')
      .then((res) => res.json())
      .then(setFlows)
      .finally(() => setIsLoading(false))
  }, [])

  return { flows, isLoading }
}
