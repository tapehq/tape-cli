import { spawn, ChildProcess, execSync } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'

import { randomString } from '../helpers/random'
import { BIN_DIR } from './config.service'

const FFMPEG = path.join(BIN_DIR, 'ffmpeg')

export default class AndroidVideo {
  process: ChildProcess | null = null

  fileName: string

  path: string

  verbose: boolean

  constructor(options: { verbose: boolean }) {
    this.fileName = `${randomString()}.mp4`
    this.path = `${os.tmpdir()}/${this.fileName}`

    this.verbose = options.verbose || false
  }

  record() {
    this.process = spawn('adb', [
      'shell',
      'screenrecord',
      `/sdcard/output.raw`,
      '--bit-rate',
      '10M',
      '--output-format',
      'h264',
    ])

    this.log(`Recording started in ${this.path}.`)

    this.process.stdout!.on('data', (data) => {
      console.log(`[process] stdout: ${data}`)
    })

    this.process.stderr!.on('data', (data) => {
      console.log(`[process] stderr: ${data}`)
    })

    this.process.on('error', (error) => {
      console.log(`[process] error: ${error.message}`)
    })
  }
  //   adb shell screenrecord --output-format=h264 --size 1440x2560 - > ./screenrecord.raw
  //

  save = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (this.process) {
        this.process.kill('SIGINT')
        this.log('[process] SIGINT BHOTKA time.')

        this.process.on('close', async (code: number) => {
          // TODO: investigate why this process ends with a null exit code and reject promise if we can get a proper exit code
          execSync(`adb pull /sdcard/output.raw ${this.path}.raw`)
          this.log('[process] File saved and ready to upload!')

          execSync(
            `${FFMPEG} -vcodec h264 -i ${this.path}.raw -vcodec copy -acodec copy ${this.path}`
          )
          resolve(this.path)
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
      console.log(`[android-video] ${text}`)
    }
  }
}
