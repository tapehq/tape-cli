import { spawn, ChildProcess } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'

import { randomString } from '../helpers/random'
import { Device } from './device.service'

export default class XcodeVideo {
  xcrun: ChildProcess | null = null

  fileName: string

  path: string

  verbose: boolean

  device: Device

  constructor(options: { device: Device; verbose?: boolean }) {
    this.fileName = `${randomString()}-raw.mp4`
    this.path = `${os.tmpdir()}/${this.fileName}`
    this.device = options.device
    this.verbose = options.verbose || false
  }

  record() {
    const args = [
      'simctl',
      'io',
      this.device.id,
      'recordVideo',
      this.path,
      '--codec=h264',
      '-f',
    ]
    if (this.device.subtype && this.device.subtype.includes('Apple-TV')) {
      args.push('--display=external')
    }
    this.xcrun = spawn('xcrun', args)

    this.log(`[xcrun] Recording started in ${this.path}.`)

    this.xcrun.stdout!.on('data', (data) => {
      console.log(`[xcrun] stdout: ${data}`)
    })

    this.xcrun.stderr!.on('data', (data) => {
      console.log(`[xcrun] stderr: ${data}`)
    })

    this.xcrun.on('error', (error) => {
      console.log(`[xcrun] error: ${error.message}`)
    })
  }

  save = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (this.xcrun) {
        this.xcrun.kill('SIGINT')
        this.log('[xcrun] SIGINT BHOTKA time.')

        this.xcrun.on('close', (code: number) => {
          if (code === 0) {
            this.log('[xcrun] File saved and ready to upload!')
            resolve(this.path)
          } else {
            this.log('[xcrun] xcrun died unsuccessfully')
            reject()
          }
        })
      }
    })
  }

  async destroy() {
    this.log('Destroying temporary video file')
    await fs.unlinkSync(this.path)
  }

  private log(text: string) {
    if (this.verbose) {
      console.log(`[xcode-video] ${text}`)
    }
  }
}
