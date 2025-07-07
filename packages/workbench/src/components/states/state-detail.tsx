import { Sidebar } from '@/components/sidebar/sidebar'
import { Braces, X } from 'lucide-react'
import React, { useState } from 'react'
import JsonView from 'react18-json-view'
import { StateItem } from './hooks/states-hooks'
import { StateValue } from './state-value'

type Props = {
  state: StateItem
  onClose: () => void
}

export const StateDetail: React.FC<Props> = ({ state, onClose }) => {
  const [isCodeEnabled, setIsCodeEnabled] = useState(false)

  return (
    <Sidebar
      onClose={onClose}
      title="State details"
      subtitle={`${state.groupId} ${state.key}`}
      actions={[
        {
          active: isCodeEnabled,
          icon: <Braces />,
          onClick: () => setIsCodeEnabled(!isCodeEnabled),
          label: 'Code',
        },
        { icon: <X />, onClick: onClose, label: 'Close' },
      ]}
    >
      <div className="flex flex-col gap-2">
        {isCodeEnabled ? <JsonView src={state.value} /> : <StateValue value={state.value} isRoot />}
      </div>
    </Sidebar>
  )
}
