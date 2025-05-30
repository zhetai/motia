import { memo } from 'react'

interface LogoIconProps {
  className?: string
}

export const LogoIcon = memo(({ className }: LogoIconProps) => {
  return (
    <svg
      data-testid="logo-icon"
      className={className}
      width="295"
      height="127"
      viewBox="0 0 295 127"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_512_36)">
        <path
          d="M0.520508 84.2194H32.0014C53.9923 84.2194 74.81 74.298 88.6654 57.2074C102.512 40.1254 123.33 30.1954 145.329 30.1954H173.394"
          className="stroke-black dark:stroke-white"
          strokeWidth="60.3909"
          strokeMiterlimit="10"
        />
        <path
          d="M119.724 84.2194H151.205C173.196 84.2194 194.014 74.298 207.869 57.2074C221.716 40.1254 242.533 30.1954 264.533 30.1954H292.597"
          className="stroke-black dark:stroke-white"
          strokeWidth="60.3909"
          strokeMiterlimit="10"
        />
        <path d="M292.477 53.8428H232.086V114.122H292.477V53.8428Z" className="fill-black dark:fill-white" />
      </g>
      <defs>
        <clipPath id="clip0_512_36">
          <rect
            width="294.199"
            height="126.993"
            className="fill-black dark:fill-white"
            transform="translate(0.520508)"
          />
        </clipPath>
      </defs>
    </svg>
  )
})
