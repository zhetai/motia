import React from 'react'
import { StateField } from './state-field'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet'

type Props = {
  state?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  onClose: () => void
}

export const StateDetail: React.FC<Props> = ({ state, onClose }) => {
  const isOpen = !!state

  const onOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const isObject = typeof state === 'object'
  const fields = Object.keys(state ?? {})

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>State details</SheetTitle>
          <SheetDescription>State details and application.</SheetDescription>
        </SheetHeader>
        <div className="font-mono overflow-y-auto">
          {state && (
            <div className="flex flex-col gap-6 ">
              {isObject && fields.map((key) => <StateField key={key} label={key} value={state[key]} />)}
              {!isObject && <StateField label="Value" value={state} />}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
