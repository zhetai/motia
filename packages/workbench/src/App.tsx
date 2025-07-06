import { Endpoints } from '@/components/endpoints/endpoints'
import { Logs } from '@/components/logs/logs'
import { APP_SIDEBAR_CONTAINER_ID } from '@/components/sidebar/sidebar'
import { States } from '@/components/states/states'
import { Flow } from '@/routes/flow'
import { TracesPage } from '@/routes/traces-page'
import { CollapsiblePanel, CollapsiblePanelGroup, TabsContent, TabsList, TabsTrigger } from '@motiadev/ui'
import { ReactFlowProvider } from '@xyflow/react'
import { File, GanttChart, Link2, LogsIcon, Workflow } from 'lucide-react'
import React from 'react'
import { Header } from './components/header/header'

export const App: React.FC = () => {
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
            defaultTab={'flow'}
            header={
              <TabsList>
                <TabsTrigger value="flow">
                  <Workflow /> Flow
                </TabsTrigger>
                <TabsTrigger value="endpoint">
                  <Link2 />
                  Endpoint
                </TabsTrigger>
              </TabsList>
            }
          >
            <TabsContent value="flow" className={'h-full'} asChild>
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
            defaultTab={'tracing'}
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
