import { spawn, ChildProcess, execSync } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'

import { randomString } from '../helpers/random'
import { BIN_DIR } from './config.service'
import { Device } from './device.service'

const FFMPEG = path.join(
  BIN_DIR,
  'ffmpeg -loglevel warning -nostats -hide_banner'
)

export default class AndroidVideo {
  process: ChildProcess | null = null

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
    this.process = spawn('adb', [
      '-s',
      this.device.id,
      'shell',
      'screenrecord',
      `/sdcard/${this.fileName}`,
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
    return new Promise((resolve) => {
      if (this.process) {
        this.process.kill('SIGINT')
        this.log('[process] SIGINT time.')

        this.process.on('close', async (/* code: number */) => {
          // TODO: investigate why this process ends with a null exit code and reject promise if we can get a proper exit code
          execSync(
            `adb -s ${this.device.id} pull /sdcard/${this.fileName} ${this.path}.h264`
          )
          this.log('[process] File saved and ready to upload!')

          let speedOption = ''

          if (this.device.isEmulator) {
            speedOption = '-vf "setpts=1.6*PTS"'
          }

          execSync(
            `${FFMPEG} -vcodec h264 -i ${this.path}.h264 ${speedOption} -r 30 ${this.path}`
          )
          resolve(this.path)
        })
      }
    })
  }

  async destroy() {
    this.log('Destroying temporary video file')
    await fs.unlinkSync(this.path)
    // TODO: also destroy the video file on the android side
  }

  private log(text: string) {
    if (this.verbose) {
      console.log(`[android-video] ${text}`)
    }
  }
}
