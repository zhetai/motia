import React from 'react'
import { Eye } from 'lucide-react'

export const Subscribe: React.FC<{ subscribes: string[] }> = ({ subscribes }) => {
  return (
    <>
      {subscribes.map((subscribe) => (
        <div
          key={subscribe}
          className="flex gap-2 items-center text-xs text-white/60"
          data-testid={`subscribes__${subscribe}`}
        >
          <Eye className="w-4 h-4 text-white/40" />
          <div className="font-mono tracking-wider">{subscribe}</div>
        </div>
      ))}
    </>
  )
}
