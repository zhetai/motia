import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import { Index } from './routes'
import { Flow } from './routes/flow'
import { RouteWrapper } from './route-wrapper'
import { LogsPage } from './routes/logs-page'
import { RootMotia } from './components/root-motia'

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)

  root.render(
    <StrictMode>
      <BrowserRouter>
        <RootMotia>
          <RouteWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/flow/:id" element={<Flow />} />
              <Route path="/logs" element={<LogsPage />} />
            </Routes>
          </RouteWrapper>
        </RootMotia>
      </BrowserRouter>
    </StrictMode>,
  )
}
