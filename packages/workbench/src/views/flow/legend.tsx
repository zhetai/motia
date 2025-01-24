import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Legend: FC<{ onHover: (type: string | null) => void }> = ({ onHover }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const legendItems = [
    {
      label: 'Event (Core)',
      type: 'event',
      bgColor: 'bg-green-950/40',
      description: 'Core logic components that process events.',
    },
    {
      label: 'API',
      type: 'api',
      bgColor: 'bg-blue-950/40',
      description: 'HTTP endpoints that trigger flows.',
    },
    {
      label: 'Noop (Non-Operation)',
      type: 'noop',
      bgColor: 'bg-zinc-950/40',
      description: 'Placeholder nodes for external processes.',
    },
    {
      label: 'Cron',
      type: 'cron',
      bgColor: 'bg-purple-950/40',
      description: 'Scheduled tasks that run at specified intervals.',
    },
  ]

  const edgeLegendItems = [
    {
      label: 'Event Edge',
      color: 'rgb(133, 176, 132)',
      description: 'Represents an event emitted and subscribed by steps.',
      dashed: true,
    },
    {
      label: 'Virtual Edge',
      color: 'rgb(147, 169, 197)',
      description: 'Represents virtual connections.',
      dashed: true,
    },
  ]

  const renderSwatch = (bgColor: string) => (
    <div className="relative group">
      <div className="absolute -inset-[1px] rounded bg-gradient-to-r from-white/20 to-white/10" />
      <div className={`relative ${bgColor} w-8 h-8 rounded border border-white/10`} />
      <div className="absolute inset-0 -z-10 translate-y-0.5 translate-x-0.5 bg-black/20 rounded border border-white/5" />
    </div>
  )

  const renderEdgeSwatch = (color: string, dashed: boolean) => (
    <svg width="48" height="10" viewBox="0 0 48 10" xmlns="http://www.w3.org/2000/svg">
      <line
        x1="0"
        y1="5"
        x2="48"
        y2="5"
        stroke={color}
        strokeWidth=".8"
        strokeDasharray={dashed ? '4 3' : 'none'}
        strokeLinecap="round"
      />
    </svg>
  )

  return (
    <div className="absolute right-4 top-4 z-10">
      <div className={cn('rounded-lg border border-zinc-700 bg-zinc-900/90', !isExpanded && 'rounded-b-lg')}>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-white font-semibold">Flow Legend</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 p-1 hover:bg-white/10"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0">
                <div className="flex flex-col gap-3">
                  {legendItems.map((item) => (
                    <div
                      key={item.type}
                      onMouseEnter={() => onHover(item.type)}
                      onMouseLeave={() => onHover(null)}
                      className="group cursor-pointer transition-all hover:bg-white/5 rounded p-1 -mx-1"
                    >
                      <div className="flex items-start gap-3">
                        {renderSwatch(item.bgColor)}
                        <div className="flex-1">
                          <div className="text-white text-xs font-medium">{item.label}</div>
                          <div className="text-white/60 text-xs mt-0.5">{item.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-white mt-4 mb-3 font-semibold">Edge Legend</div>
                <div className="flex flex-col gap-3">
                  {edgeLegendItems.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      {renderEdgeSwatch(item.color, item.dashed)}
                      <div className="flex-1">
                        <div className="text-white text-xs font-medium">{item.label}</div>
                        <div className="text-white/60 text-xs mt-0.5">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
