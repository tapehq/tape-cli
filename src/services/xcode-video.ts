import { spawn, ChildProcess } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'

import { randomString } from '../helpers/random'

export default class XcodeVideo {
  xcrun: ChildProcess | null = null

  fileName: string

  path: string

  verbose: boolean

  constructor(options: { verbose: boolean }) {
    this.fileName = `${randomString()}.mp4`
    this.path = `${os.tmpdir()}/${this.fileName}`

    this.verbose = options.verbose || false
  }

  record() {
    this.xcrun = spawn('xcrun', [
      'simctl',
      'io',
      'booted',
      'recordVideo',
      this.path,
      '--codec=h264',
      '-f',
    ])

    this.log(`[xcrun] Recording started in ${this.path}.`)

    // this.xcrun.stdout.on('data', (data) => {
    //   console.log(`[xcrun] stdout: ${data}`)
    // })

    // this.xcrun.stderr.on('data', (data) => {
    //   console.log(`[xcrun] stderr: ${data}`)
    // })

    // this.xcrun.on('error', (error) => {
    //   console.log(`[xcrun] error: ${error.message}`)
    // })
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
      console.log(`[xcode-screenshot] ${text}`)
    }
  }
}
