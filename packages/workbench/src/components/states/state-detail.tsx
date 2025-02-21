import React from 'react'
import { StateValue } from './state-value'
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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>State details</SheetTitle>
          <SheetDescription>State details and application.</SheetDescription>
        </SheetHeader>
        <div className="font-mono overflow-y-auto">
          {state && (
            <div className="flex flex-col gap-2">
              <StateValue value={state} isRoot />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
