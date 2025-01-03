import { AppSidebar } from './components/app-sidebar'
import { SidebarProvider } from './components/ui/sidebar'
import { WorkflowView } from './views/workflow-view'

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="w-screen h-screen">
        <WorkflowView />
      </div>
    </SidebarProvider>
  )
}

export default App
