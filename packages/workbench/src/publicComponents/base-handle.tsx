import React, { HTMLAttributes } from 'react'
import { HandleProps, Position, Handle as RFHandle } from '@xyflow/react'
import clsx from 'clsx'
import { colorMap } from './colorMap'

type Props = HandleProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'id'> & {
    isHidden?: boolean
    variant?: string | null
  }

export const BaseHandle: React.FC<Props> = (props) => {
  const { isHidden, position, variant, ...rest } = props

  return (
    <div
      className={clsx(
        'absolute w-[6px] h-[6px]',
        position === Position.Top && '-top-[20px]',
        position === Position.Bottom && '-bottom-[20px]',
        'left-1/2 -ml-[2px]',
        isHidden && 'hidden',
      )}
    >
      <RFHandle
        {...rest}
        position={position}
        style={{
          background: colorMap[variant as keyof typeof colorMap],
        }}
        className="
        !static
        !w-[6px]
        !h-[6px]
        !min-w-[6px]
        !min-h-[6px]
        !p-0
        !border-none
        !transform-none
        !rounded-full
        !outline-none
        !shadow-none
      "
      />
    </div>
  )
}
