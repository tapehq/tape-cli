import { spawn, ChildProcess } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'

import { randomString } from '../helpers/random'
import { Device } from './device.service'
import { debug } from '../services/message.service'

export default class XcodeVideo {
  xcrun: ChildProcess | null = null

  fileName: string

  path: string

  device: Device

  constructor(options: { device: Device }) {
    this.fileName = `${randomString()}-raw.mp4`
    this.path = `${os.tmpdir()}/${this.fileName}`
    this.device = options.device
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

    debug(`[xcrun] Recording started in ${this.path}.`)

    this.xcrun.stdout!.on('data', (data) => {
      debug(`[xcrun] stdout: ${data}`)
    })

    this.xcrun.stderr!.on('data', (data) => {
      debug(`[xcrun] stderr: ${data}`)
    })

    this.xcrun.on('error', (error) => {
      debug(`[xcrun] error: ${error.message}`)
    })
  }

  save = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (this.xcrun) {
        this.xcrun.kill('SIGINT')
        debug('[xcrun] SIGINT BHOTKA time.')

        this.xcrun.on('close', (code: number) => {
          if (code === 0) {
            debug('[xcrun] File saved and ready to upload!')
            resolve(this.path)
          } else {
            debug('[xcrun] xcrun died unsuccessfully')
            reject()
          }
        })
      }
    })
  }

  async destroy() {
    debug('Destroying temporary video file')
    await fs.unlinkSync(this.path)
  }
}
