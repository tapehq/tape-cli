import { spawn, ChildProcess } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'

import { randomString } from '../helpers/random'
import { Device } from './device.service'
import { getXcodeDeviceOrientation } from '../helpers/orientation.helpers'

export default class XcodeScreenshot {
  xcrun: ChildProcess | null = null

  fileName: string

  path: string

  verbose: boolean

  device: Device

  constructor(options: { device: Device; verbose?: boolean }) {
    this.fileName = `${randomString()}-raw.png`
    this.path = `${os.tmpdir()}/${this.fileName}`
    this.device = options.device
    this.verbose = options.verbose || false
  }

  save = async (): Promise<string> => {
    this.log(`Taking screenshot and saving to ${this.path}`)
    const xcrun = spawn('xcrun', [
      'simctl',
      'io',
      this.device.id,
      'screenshot',
      this.path,
    ])

    return new Promise((resolve, reject) => {
      xcrun.on('close', (code: number) => {
        this.log(`Screenshot process closed with code ${code}`)

        if (code === 0) {
          this.log('File saved and ready to upload!')

          resolve(this.path)
        } else {
          this.log('xcrun died unsuccessfully')
          this.destroy()
          reject()
        }
      })
    })
  }

  async destroy() {
    this.log('Destroying temporary screenshot file')
    await fs.unlinkSync(this.path)
  }

  private log(text: string) {
    if (this.verbose) {
      console.log(`[xcode-screenshot] ${text}`)
    }
  }
}
