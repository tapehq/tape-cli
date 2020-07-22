import { spawn, ChildProcess } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'

import { randomString } from '../helpers/random'
import { Device } from './device.service'
import { debug } from '../services/message.service'

export default class XcodeScreenshot {
  xcrun: ChildProcess | null = null

  fileName: string

  path: string

  device: Device

  constructor(options: { device: Device }) {
    this.fileName = `${randomString()}-raw.png`
    this.path = `${os.tmpdir()}/${this.fileName}`
    this.device = options.device
  }

  save = async (): Promise<string> => {
    debug(`Taking screenshot and saving to ${this.path}`)
    const xcrun = spawn('xcrun', [
      'simctl',
      'io',
      this.device.id,
      'screenshot',
      this.path,
    ])

    return new Promise((resolve, reject) => {
      xcrun.on('close', (code: number) => {
        debug(`Screenshot process closed with code ${code}`)

        if (code === 0) {
          debug('File saved and ready to upload!')

          resolve(this.path)
        } else {
          debug('xcrun died unsuccessfully')
          this.destroy()
          reject()
        }
      })
    })
  }

  async destroy() {
    debug('Destroying temporary screenshot file')
    await fs.unlinkSync(this.path)
  }
}
