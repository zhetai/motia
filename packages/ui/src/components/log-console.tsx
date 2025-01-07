import { useMemo, useState } from 'react'
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import { useTriggerLogs } from '@/stores/triggerLogs'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp, Trash2, Terminal } from 'lucide-react'

const timestamp = (time: number) => {
  const date = new Date(Number(time))
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

export const LogConsole = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const messages = useTriggerLogs((state) => state.messages)
  const resetMessages = useTriggerLogs((state) => state.resetMessages)
  const traceIds = useMemo(() => Object.keys(messages), [messages])

  const toggleExpand = () => setIsExpanded((prev) => !prev)

  return (
    <div className="absolute bottom-0 left-0 right-0 w-full bg-black h-fit z-40">
      <div className="flex justify-between w-full items-center p-2">
        <label className="text-green-500 w-full text-left justify-start h-full text-lg font-bold">Logs</label>
        {traceIds.length > 0 && (
          <Button variant="link" onClick={() => resetMessages()} className="text-green-500">
            <Trash2 className="w-4 h-4 text-green-500" />
            Clear logs
          </Button>
        )}
        <Button variant="link" onClick={toggleExpand} className="text-green-500">
          {isExpanded && <ChevronDown className="w-4 h-4 text-green-500" />}
          {!isExpanded && <ChevronUp className="w-4 h-4 text-green-500" />}
        </Button>
      </div>
      {isExpanded && <div className="divide-solid divide-green-500 divide-y" />}
      <Collapsible open={isExpanded} className={`w-full`}>
        <CollapsibleContent>
          <motion.div
            className="overflow-y-auto h-[25vh] flex flex-col gap-2 py-2"
            initial={{ height: 0 }}
            animate={{ height: '25vh' }}
            transition={{ duration: 0.3 }}
          >
            {traceIds.map((traceId, index) => (
              <div key={index} className="flex flex-col gap-2 px-2">
                {messages[traceId]?.map((message, mIndex) => (
                  <div key={mIndex} className="flex items-center gap-1 font-mono">
                    <Terminal className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">[{timestamp(message.time)}]</span>
                    {message.message}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
