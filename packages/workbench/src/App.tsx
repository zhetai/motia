import React from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Header } from './components/header/header'
import { CollapsiblePanel, CollapsiblePanelGroup, TabsContent, TabsList, TabsTrigger } from '@motiadev/ui'
import { Link2, Workflow } from 'lucide-react'
import { Flow } from '@/routes/flow'
import { Logs } from '@/components/logs/logs'
import { Endpoints } from '@/components/endpoints/endpoints'
import { States } from '@/components/states/states'
import { TracesPage } from '@/routes/traces-page'

export const App: React.FC = () => {
  return (
    <div className="flex flex-col bg-background text-foreground h-screen overflow-hidden">
      <ReactFlowProvider>
        <Header />
        <main className="m-2 flex flex-col h-full min-h-0" role="main">
          <CollapsiblePanelGroup
            autoSaveId={'app-panel'}
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
              <TabsContent value="flow" className={'h-full'}>
                <Flow />
              </TabsContent>
              <TabsContent value="endpoint">
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
                    <Workflow /> Tracing
                  </TabsTrigger>
                  <TabsTrigger value="logs">
                    <Link2 />
                    Logs
                  </TabsTrigger>
                  <TabsTrigger value="states">
                    <Link2 />
                    States
                  </TabsTrigger>
                </TabsList>
              }
            >
              <TabsContent value="tracing" className="max-h-fit">
                <TracesPage />
              </TabsContent>
              <TabsContent value="logs">
                <Logs />
              </TabsContent>
              <TabsContent value="states">
                <div className="w-full h-full overflow-hidden bg-background text-foreground">
                  <header className="p-4 border-b border-border">
                    <h1 className="text-xl font-bold text-foreground">State details</h1>
                    <span className="text-sm text-muted-foreground">
                      Check all states saved locally along with all fields
                    </span>
                  </header>
                  <States />
                </div>
              </TabsContent>
            </CollapsiblePanel>
          </CollapsiblePanelGroup>
        </main>
      </ReactFlowProvider>
    </div>
  )
}
