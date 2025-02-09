import React from 'react'
import { cn } from '../../lib/utils'

type Props = {
  label: string
  value: string | React.ReactNode
  className?: string
}

const LogValue: React.FC<{ value: unknown }> = ({ value }) => {
  if (React.isValidElement(value)) {
    return value
  }

  if (typeof value === 'object') {
    const valueObject = value as object

    return (
      <div className="flex flex-col gap-2">
        {Object.keys(valueObject).map((key) => (
          <div className="ml-8 flex flex-col" key={key}>
            <span className="text-gray-400 text-xs font-bold">{key}</span>
            <span className="text-large font-bold">
              {value ? (
                <LogValue value={valueObject[key as keyof typeof valueObject]} />
              ) : (
                JSON.stringify(valueObject[key as keyof typeof valueObject])
              )}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return `${value}`
}

export const LogField = ({ label, value, className }: Props) => {
  return (
    <div className={cn('flex row gap-8 bg-gray-900 text-white p-4 rounded-lg font-bold text-sm', className)}>
      <div className="flex flex-col gap-1">
        <span className="text-gray-400 text-xs font-bold">{label}</span>
        <span className="text-large font-bold">{value ? <LogValue value={value} /> : JSON.stringify(value)}</span>
      </div>
    </div>
  )
}
