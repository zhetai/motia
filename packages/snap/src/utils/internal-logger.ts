import colors from 'colors'

const infoTag = colors.blue('➜ [INFO]')
const warnTag = colors.yellow('➜ [WARN]')
const errorTag = colors.red('✘ [ERROR]')

const colorMap = {
  cyan: colors.cyan,
  yellow: colors.yellow,
  red: colors.red,
}

const extraTag = (color: 'cyan' | 'yellow' | 'red', extra?: string) => {
  const colorFn = colorMap[color as keyof typeof colorMap]

  return extra ? colors.bold(colorFn(extra)) : ''
}

export const internalLogger = {
  info: (message: string, extra?: string) => {
    console.log(`${infoTag} ${message} ${extraTag('cyan', extra)}`)
  },
  warn: (message: string, extra?: string) => {
    console.log(`${warnTag} ${message} ${extraTag('yellow', extra)}`)
  },
  error: (message: string, extra?: string) => {
    console.log(`${errorTag} ${message} ${extraTag('red', extra)}`)
  },
}
