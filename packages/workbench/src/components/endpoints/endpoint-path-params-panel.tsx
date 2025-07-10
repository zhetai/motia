import { Input, Panel } from '@motiadev/ui'
import { FC, Fragment, useMemo, useState } from 'react'
import { usePathParams } from './hooks/use-path-params'
import { ApiEndpoint } from '@/types/endpoint'

type Props = { endpoint: ApiEndpoint; onChange?: (pathParamsValues: Record<string, string>) => void }

export const EndpointPathParamsPanel: FC<Props> = ({ endpoint, onChange }) => {
  const pathParams = usePathParams(endpoint.path)
  const [pathParamsValues, setPathParamsValues] = useState<Record<string, string>>(
    pathParams?.reduce((acc, param) => ({ ...acc, [param]: '' }), {} as Record<string, string>),
  )

  const onPathParamChange = (param: string, value: string) => {
    const newPathParamsValues = { ...pathParamsValues, [param]: value }
    setPathParamsValues(newPathParamsValues)
    onChange?.(newPathParamsValues)
  }

  const subtitle = useMemo(() => {
    if (onChange) {
      return Object.entries(pathParamsValues).reduce((acc, [param, value]) => {
        if (!value) {
          return acc
        }
        return acc.replace(`:${param}`, value)
      }, endpoint.path)
    }
    return endpoint.path
  }, [pathParamsValues, endpoint.path, onChange])

  if (!pathParams.length) {
    return null
  }

  return (
    <Panel title="Path params" subtitle={subtitle} size="sm" variant="outlined">
      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {pathParams.map((param) => (
          <Fragment key={param}>
            <div className="font-bold leading-[36px] flex text-xs">{param}</div>
            <div className="flex items-center text-xs">
              {onChange ? (
                <Input
                  className="w-full text-xs"
                  placeholder={`:${param}`}
                  value={pathParamsValues[param]}
                  onChange={(e) => onPathParamChange(param, e.target.value)}
                />
              ) : (
                <span className="text-xs">{`:${param}`}</span>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </Panel>
  )
}
