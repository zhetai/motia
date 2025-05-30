import { cva } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import { EndpointBadge } from './endpoint-badge'
import { EndpointCall } from './endpoint-call'
import { ApiEndpoint, useGetEndpoints } from './hooks/use-get-endpoints'
import { SelectedEndpoint } from './selected-endpoint'

const endpointVariants = cva('flex flex-col gap-2 font-mono p-2 rounded-lg cursor-pointer', {
  variants: {
    method: {
      GET: 'bg-lime-500/20',
      POST: 'bg-blue-500/20',
      PUT: 'bg-yellow-500/20',
      DELETE: 'bg-red-500/20',
      PATCH: 'bg-yellow-500/20',
      HEAD: 'bg-blue-500/20',
      OPTIONS: 'bg-purple-500/20',
    },
  },
  defaultVariants: { method: 'GET' },
})

export const Endpoints = () => {
  const endpoints = useGetEndpoints()
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)

  useEffect(() => {
    setSelectedEndpoint((selected) => {
      if (!selected) return null

      const endpoint = endpoints.find(
        (endpoint) => endpoint.method === selected.method && endpoint.path === selected.path,
      )

      return endpoint ?? null
    })
  }, [endpoints])

  return (
    <div className="flex flex-row w-full h-full">
      <div className="flex flex-col gap-2 flex-1 m-4 mr-2 overflow-y-auto">
        <header>
          <h1 className="text-2xl font-bold">API Endpoints</h1>
          <span className="text-sm text-zinc-400">Check all API endpoints</span>
        </header>
        {endpoints.map((endpoint) => (
          <div
            key={`${endpoint.method} ${endpoint.path}`}
            className={endpointVariants({ method: endpoint.method })}
            onClick={() => setSelectedEndpoint(endpoint)}
          >
            <div className="flex flex-row gap-2 items-center">
              <EndpointBadge variant={endpoint.method as never}>{endpoint.method.toUpperCase()}</EndpointBadge>
              <span className="text-md font-bold">{endpoint.path}</span>
              {!selectedEndpoint && <span className="text-xs text-muted-foreground">{endpoint.description}</span>}
            </div>
            {selectedEndpoint && <span className="text-xs text-muted-foreground">{endpoint.description}</span>}

            {selectedEndpoint === endpoint && <SelectedEndpoint endpoint={selectedEndpoint} />}
          </div>
        ))}
      </div>
      {selectedEndpoint && (
        <div className="flex flex-col gap-2 flex-1 m-4 ml-2 p-4 rounded-lg bg-muted">
          <EndpointCall endpoint={selectedEndpoint} onClose={() => setSelectedEndpoint(null)} />
        </div>
      )}
    </div>
  )
}
