import { useTheme } from '@/hooks/use-theme'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@motiadev/ui'
import { FC } from 'react'
import ReactJson from 'react18-json-view'

export type EndpointResponseItem = {
  responseCode: string
  responseBody: unknown
}

type EndpointResponseProps = {
  items: EndpointResponseItem[]
}

export const EndpointResponseSchema: FC<EndpointResponseProps> = ({ items }) => {
  const { theme } = useTheme()

  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col rounded-lg mt-6 border" data-testid="endpoint-response-container">
      <Tabs defaultValue={items[0].responseCode}>
        <div className="flex items-center justify-between bg-card">
          <TabsList className="bg-transparent p-0">
            {items.map((item) => (
              <TabsTrigger
                value={item.responseCode}
                key={item.responseCode}
                className="text-xs font-bold cursor-pointer"
              >
                {item.responseCode}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {items.map(({ responseCode, responseBody }) => (
          <TabsContent value={responseCode} key={responseCode} className="border-t">
            <div className="text-xs font-mono rounded-lg whitespace-pre-wrap">
              <ReactJson
                src={responseBody as object}
                dark={theme === 'dark'}
                enableClipboard={false}
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
