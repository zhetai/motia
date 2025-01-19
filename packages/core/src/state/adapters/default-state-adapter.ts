import { StateAdapter } from '../state-adapter'
import { promises as fs } from 'fs'
import * as path from 'path'

export type FileAdapterConfig = {
  filePath: string
}

export class FileStateAdapter implements StateAdapter {
  private filePath: string

  constructor(config: FileAdapterConfig) {
    this.filePath = path.join(config.filePath, 'motia-state.json')
  }

  async init() {
    const dir = this.filePath.replace('motia-state.json', '')
    try {
      await fs.realpath(dir)
    } catch (err) {
      await fs.mkdir(dir, { recursive: true })
    }

    try {
      await fs.readFile(this.filePath, 'utf-8')
    } catch (err) {
      fs.writeFile(this.filePath, JSON.stringify({}), 'utf-8')
    }
  }

  async get(traceId: string, key: string) {
    const data = await this._readFile()
    const fullKey = this._makeKey(traceId, key)

    return data[fullKey] ? JSON.parse(data[fullKey]) : null
  }

  async set(traceId: string, key: string, value: any) {
    const data = await this._readFile()
    const fullKey = this._makeKey(traceId, key)

    data[fullKey] = JSON.stringify(value)

    await this._writeFile(data)
  }

  async delete(traceId: string, key: string) {
    const data = await this._readFile()
    const fullKey = this._makeKey(traceId, key)

    delete data[fullKey]

    await this._writeFile(data)
  }

  async clear(traceId: string) {
    const data = await this._readFile()
    const pattern = this._makeKey(traceId, '')

    for (const key in data) {
      if (key.startsWith(pattern)) {
        delete data[key]
      }
    }

    await this._writeFile(data)
  }

  async cleanup() {
    // No cleanup needed for file system
  }

  private _makeKey(traceId: string, key: string) {
    return `${traceId}:${key}`
  }

  private async _readFile() {
    console.log('Reading file', this.filePath)
    const content = await fs.readFile(this.filePath, 'utf-8')
    return JSON.parse(content)
  }

  private async _writeFile(data: any) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
  }
}
