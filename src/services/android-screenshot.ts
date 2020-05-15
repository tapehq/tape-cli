import * as os from 'os'
import * as fs from 'fs'
import * as adb from 'adbkit'

import { randomString } from '../helpers/random'
import { getAndroidDevices } from './device.service'

export default class AndroidScreenShot {
  fileName: string

  path: string

  verbose: boolean

  constructor(options: { verbose: boolean }) {
    this.fileName = `${randomString()}.png`
    this.path = `${os.tmpdir()}/${this.fileName}`

    this.verbose = options.verbose || false
  }

  save = async (): Promise<string> => {
    const client = adb.createClient()
    const devices = await getAndroidDevices()
    const screenshot = await client.screencap(devices[0].id)

    return new Promise((resolve, reject) => {
      this.log(`Taking screenshot and saving to ${this.path}`)

      const dest = fs.createWriteStream(this.path)
      dest.once('close', () => {
        this.log('Done')
        resolve(this.path)
      })
      screenshot.pipe(dest)
    })
  }

  async destroy() {
    this.log('Destroying temporary screenshot file')
    await fs.unlinkSync(this.path)
  }

  private log(text: string) {
    if (this.verbose) {
      console.log(`[android-screenshot] ${text}`)
    }
  }
}
