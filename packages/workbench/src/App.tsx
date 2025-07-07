import { Logs } from '@/components/logs/logs'
import { APP_SIDEBAR_CONTAINER_ID } from '@/components/sidebar/sidebar'
import { States } from '@/components/states/states'
import { TracesPage } from '@/routes/traces-page'
import { CollapsiblePanel, CollapsiblePanelGroup, TabsContent, TabsList, TabsTrigger } from '@motiadev/ui'
import { File, GanttChart, Link2, LogsIcon } from 'lucide-react'
import React from 'react'
import { Header } from './components/header/header'
import { ReactFlowProvider } from '@xyflow/react'
import { Flow } from '@/routes/flow'
import { Endpoints } from '@/components/endpoints/endpoints'
import { FlowTabMenuItem } from '@/components/flow-tab-menu-item/flow-tab-menu-item'
import { useTabsStore } from './stores/use-tabs-store'

export const App: React.FC = () => {
  const tab = useTabsStore((state) => state.tab)
  const setTopTab = useTabsStore((state) => state.setTopTab)
  const setBottomTab = useTabsStore((state) => state.setBottomTab)

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
            onTabChange={setTopTab}
            header={
              <TabsList>
                <TabsTrigger value="flow">
                  <FlowTabMenuItem />
                </TabsTrigger>
                <TabsTrigger value="endpoint">
                  <Link2 />
                  Endpoint
                </TabsTrigger>
              </TabsList>
            }
          >
            <TabsContent value="flow" className="h-full" asChild>
              <ReactFlowProvider>
                <Flow />
              </ReactFlowProvider>
            </TabsContent>
            <TabsContent value="endpoint" asChild>
              <Endpoints />
            </TabsContent>
          </CollapsiblePanel>
          <CollapsiblePanel
            id="bottom-panel"
            variant={'tabs'}
            defaultTab={tab.bottom}
            onTabChange={setBottomTab}
            header={
              <TabsList>
                <TabsTrigger value="tracing">
                  <GanttChart /> Tracing
                </TabsTrigger>
                <TabsTrigger value="logs">
                  <LogsIcon />
                  Logs
                </TabsTrigger>
                <TabsTrigger value="states">
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
              <Logs />
            </TabsContent>
            <TabsContent value="states" asChild>
              <States />
            </TabsContent>
          </CollapsiblePanel>
        </CollapsiblePanelGroup>
      </main>
      <div id={APP_SIDEBAR_CONTAINER_ID} />
    </div>
  )
}
