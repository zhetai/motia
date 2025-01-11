import path from 'path'
import fs from 'fs'
import { LockFile } from './../wistro.types'
import { globalLogger } from './logger'

export const loadLockFile = (): LockFile => {
  const lockFilePath = path.join(process.cwd(), 'wistro.lock.json')

  if (!fs.existsSync(lockFilePath)) {
    globalLogger.error('Lock file not found, please generate it before building flows, run wistro build --help')

    throw Error('Lock file not found')
  }

  const lockData: LockFile = JSON.parse(fs.readFileSync(lockFilePath, 'utf-8'))

  // TODO: add zod schema validation for lock data
  return { ...lockData, baseDir: process.cwd() }
}
