import { useMemo, useState } from 'react'
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import { useTriggerLogs } from '@/stores/triggerLogs'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { ArrowDownToLine, ArrowUpToLine, Trash2, Terminal } from 'lucide-react'

export const LogConsole = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesMapped = useTriggerLogs((state) => state.messages)
  const resetMessages = useTriggerLogs((state) => state.resetMessages)
  const messages = useMemo(() => Object.values(messagesMapped), [messagesMapped])

  const toggleExpand = () => setIsExpanded((prev) => !prev)

  return (
    <div className="absolute bottom-0 left-0 right-0 w-full bg-black border-t-2 border-solid border-green-500 h-fit z-40">
      <div className="flex justify-between w-full items-center p-2">
        <label className="text-green-500 w-full text-left justify-start h-full">Logs</label>
        {messages.length > 0 && (
          <Button variant="link" onClick={() => resetMessages()} className="text-green-500">
            <Trash2 className="w-4 h-4 text-green-500" />
          </Button>
        )}
        <Button variant="link" onClick={toggleExpand} className="text-green-500">
          {isExpanded && <ArrowDownToLine className="w-4 h-4 text-green-500" />}
          {!isExpanded && <ArrowUpToLine className="w-4 h-4 text-green-500" />}
        </Button>
      </div>
      {isExpanded && <div className="divide-solid divide-green-500 divide-y" />}
      <Collapsible open={isExpanded} className={`w-full ${isExpanded && 'border-t-2 border-solid border-green-500'}`}>
        <CollapsibleContent>
          <motion.div
            className="overflow-y-auto h-[25vh] flex flex-col gap-2 py-2"
            initial={{ height: 0 }}
            animate={{ height: '25vh' }}
            transition={{ duration: 0.3 }}
          >
            {messages.map((msg, index) => (
              <div key={index} className="flex items-center gap-1">
                <Terminal className="h-4 w-4 text-green-500" />
                {msg}
                <br />
              </div>
            ))}
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
