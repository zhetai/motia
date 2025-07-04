import { Panel, type PanelProps } from '@motiadev/ui'
import { createPortal } from 'react-dom'
import { FC } from 'react'

export const APP_SIDEBAR_CONTAINER_ID = 'app-sidebar-container'

export const Sidebar: FC<PanelProps> = (props) => {
  return createPortal(
    <div id={APP_SIDEBAR_CONTAINER_ID} className="w-[400px] h-full pr-2 py-2 max-h-full">
      <Panel {...props} />
    </div>,
    document.querySelector(`#${APP_SIDEBAR_CONTAINER_ID}`) as Element,
  )
}
