import React, { HTMLAttributes } from 'react'
import { HandleProps, Position, Handle as RFHandle } from '@xyflow/react'
import clsx from 'clsx'

type StudioHandleProps = {
  label?: string
  isHidden?: boolean
}

type Props = StudioHandleProps & HandleProps & Omit<HTMLAttributes<HTMLDivElement>, 'id'>

const handleClasses = [
  '!relative',
  '!flex',
  '!items-center',
  '!w-9',
  '!h-9',
  '!bg-transparent',
  '!transform',
  '!border-0',
  '!left-auto',
  'after:!absolute',
  'after:!top-[15px]',
  'after:!left-[15px]',
  'after:!w-1.5',
  'after:!h-1.5',
  "after:!content-[' ']",
  'after:!bg-white',
  'after:!rounded-full',
].join(' ')

export const BaseHandle: React.FC<Props> = (props) => {
  const { isHidden, position, ...rest } = props

  return (
    <div
      className={clsx(
        'absolute w-6 h-6',
        position === Position.Top && 'top-[-26px]',
        position === Position.Bottom && 'bottom-[-13px]',
        position === Position.Left && 'left-[-32px]',
        position === Position.Right && 'right-[-20px]',
        [Position.Top, Position.Bottom].includes(position) && 'left-[calc(50%-20px)]',
        [Position.Left, Position.Right].includes(position) && 'bottom-[calc(50%+10px)]',
        isHidden && 'hidden',
      )}
    >
      <div className="relative flex items-center w-9 h-9 bg-transparent border-0">
        <RFHandle {...rest} position={position} className={handleClasses} />
      </div>
    </div>
  )
}
