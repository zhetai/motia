import { useLogs } from '@/stores/use-logs'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { Logs } from './logs'

const MIN_HEIGHT = 100
const DEFAULT_HEIGHT = 200

export const LogConsole = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [height, setHeight] = useState(DEFAULT_HEIGHT)
  const logs = useLogs((state) => state.logs)
  const resetLogs = useLogs((state) => state.resetLogs)
  const dragRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const windowHeight = window.innerHeight
      const mouseY = e.clientY
      const newHeight = windowHeight - mouseY

      if (newHeight >= MIN_HEIGHT) {
        setHeight(newHeight)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div className="absolute bottom-0 left-0 right-0 w-full bg-zinc-900/90 border-t border-zinc-700">
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute -top-1 left-0 right-0 h-1 cursor-ns-resize hover:bg-green-500/20',
          isDragging && 'bg-green-500/40',
        )}
      />
      <div className="flex justify-between w-full items-center p-2">
        <label className="text-green-500 w-full text-left justify-start h-full text-lg font-bold">Logs</label>
        {logs.length > 0 && (
          <Button variant="link" onClick={resetLogs} className="text-green-500">
            <Trash2 className="w-4 h-4 text-green-500" />
            Clear logs
          </Button>
        )}
        <Button variant="link" onClick={toggleExpand} className="text-green-500">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="log-content"
            initial={{ height: 0 }}
            animate={{ height }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Logs />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
