import { CollapsiblePanel, CollapsiblePanelGroup, TabsContent, TabsList, TabsTrigger } from '@motiadev/ui'
import { ReactFlowProvider } from '@xyflow/react'
import { analytics } from '@/lib/analytics'
import { File, GanttChart, Link2, LogsIcon } from 'lucide-react'
import React from 'react'
import { EndpointsPage } from './components/endpoints/endpoints-page'
import { FlowPage } from './components/flow/flow-page'
import { FlowTabMenuItem } from './components/flow/flow-tab-menu-item'
import { Header } from './components/header/header'
import { LogsPage } from './components/logs/logs-page'
import { TracesPage } from './components/observability/traces-page'
import { APP_SIDEBAR_CONTAINER_ID } from './components/sidebar/sidebar'
import { StatesPage } from './components/states/states-page'
import { useTabsStore } from './stores/use-tabs-store'

enum TabLocation {
  TOP = 'top',
  BOTTOM = 'bottom',
}

export const App: React.FC = () => {
  const tab = useTabsStore((state) => state.tab)
  const setTopTab = useTabsStore((state) => state.setTopTab)
  const setBottomTab = useTabsStore((state) => state.setBottomTab)

  const tabChangeCallbacks = React.useMemo<Record<TabLocation, (tab: string) => void>>(
    () => ({
      [TabLocation.TOP]: setTopTab,
      [TabLocation.BOTTOM]: setBottomTab,
    }),
    [setTopTab, setBottomTab],
  )

  const onTabChange = React.useCallback(
    (location: TabLocation) => (newTab: string) => {
      analytics.track(`${location} tab changed`, { [`new.${location}`]: newTab, tab })
      tabChangeCallbacks[location](newTab)
    },
    [tabChangeCallbacks],
  )

  return (
    <div className="grid grid-rows-[auto_1fr] grid-cols-[1fr_auto] bg-background text-foreground h-screen">
      <div className="col-span-2">
        <Header />
      </div>
      <main className="m-2 overflow-hidden" role="main">
        <CollapsiblePanelGroup
          autoSaveId="app-panel"
          direction="vertical"
          className="gap-1 h-full"
          aria-label="Workbench panels"
        >
          <CollapsiblePanel
            id="top-panel"
            variant={'tabs'}
            defaultTab={tab.top}
            onTabChange={onTabChange(TabLocation.TOP)}
            header={
              <TabsList>
                <TabsTrigger value="flow" data-testid="flows-link">
                  <FlowTabMenuItem />
                </TabsTrigger>
                <TabsTrigger value="endpoint" data-testid="endpoints-link">
                  <Link2 />
                  Endpoint
                </TabsTrigger>
              </TabsList>
            }
          >
            <TabsContent value="flow" className="h-full" asChild>
              <ReactFlowProvider>
                <FlowPage />
              </ReactFlowProvider>
            </TabsContent>
            <TabsContent value="endpoint" asChild>
              <EndpointsPage />
            </TabsContent>
          </CollapsiblePanel>
          <CollapsiblePanel
            id="bottom-panel"
            variant={'tabs'}
            defaultTab={tab.bottom}
            onTabChange={onTabChange(TabLocation.BOTTOM)}
            header={
              <TabsList>
                <TabsTrigger value="tracing" data-testid="traces-link">
                  <GanttChart /> Tracing
                </TabsTrigger>
                <TabsTrigger value="logs" data-testid="logs-link">
                  <LogsIcon />
                  Logs
                </TabsTrigger>
                <TabsTrigger value="states" data-testid="states-link">
                  <File />
                  States
                </TabsTrigger>
              </TabsList>
            }
          >
            <TabsContent value="tracing" className="max-h-fit" asChild>
              <TracesPage />
            </TabsContent>
            <TabsContent value="logs" asChild>
              <LogsPage />
            </TabsContent>
            <TabsContent value="states" asChild>
              <StatesPage />
            </TabsContent>
          </CollapsiblePanel>
        </CollapsiblePanelGroup>
      </main>
      <div id={APP_SIDEBAR_CONTAINER_ID} />
    </div>
  )
}
