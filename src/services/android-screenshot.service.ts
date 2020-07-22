import * as os from 'os'
import * as fs from 'fs'
import * as adb from 'adbkit'

import { randomString } from '../helpers/random'
import { Device } from './device.service'
import { debug } from '../services/message.service'

export default class AndroidScreenShot {
  fileName: string

  path: string

  device: Device

  constructor(options: { device: Device }) {
    this.fileName = `${randomString()}-raw.png`
    this.path = `${os.tmpdir()}/${this.fileName}`
    this.device = options.device
  }

  save = async (): Promise<string> => {
    const client = adb.createClient()
    const screenshot = await client.screencap(this.device.id)

    return new Promise((resolve, reject) => {
      debug(`Taking screenshot and saving to ${this.path}`)

      try {
        const dest = fs.createWriteStream(this.path)
        dest.once('close', () => {
          debug('Done')
          resolve(this.path)
        })
        screenshot.pipe(dest)
      } catch (error) {
        reject(error)
      }
    })
  }

  async destroy() {
    debug('Destroying temporary screenshot file')
    await fs.unlinkSync(this.path)
  }
}
