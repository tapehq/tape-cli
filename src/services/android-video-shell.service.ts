import { isMac } from '../helpers/utils'
import { spawn, ChildProcess, execSync } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'

import { randomString } from '../helpers/random'
import { Device } from './device.service'
import { getFfmpegBin } from './ffmpeg.service'
import { debug } from '../services/message.service'

export default class AndroidVideoShell {
  process: ChildProcess | null = null

  fileName: string

  path: string

  device: Device

  constructor(options: { device: Device }) {
    this.fileName = `${randomString()}-raw.mp4`
    this.path = `${os.tmpdir()}/${this.fileName}`
    this.device = options.device
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

    debug(`Recording started in ${this.path}.`)

    this.process.stdout!.on('data', (data) => {
      debug(`[process] stdout: ${data}`)
    })

    this.process.stderr!.on('data', (data) => {
      debug(`[process] stderr: ${data}`)
    })

    this.process.on('error', (error) => {
      debug(`[process] error: ${error.message}`)
    })
  }
  //   adb shell screenrecord --output-format=h264 --size 1440x2560 - > ./screenrecord.raw
  //

  speedUpRequired = () => {
    return this.device.isEmulator && isMac()
  }

  save = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (this.process) {
        this.process.kill('SIGINT')
        debug('SIGINT')

        this.process.on('close', async (/* code: number */) => {
          // TODO: investigate why this process ends with a null exit code and reject promise if we can get a proper exit code
          execSync(
            `adb -s ${this.device.id} pull /sdcard/${this.fileName} ${this.path}.h264`
          )
          debug('File saved and ready to upload!')

          let speedOption = ''

          if (this.speedUpRequired()) {
            speedOption = '-vf "setpts=1.6*PTS"'
          }

          execSync(
            `${getFfmpegBin()} -vcodec h264 -i ${this.path}.h264 ${speedOption} -r 30 ${this.path}`
          )
          resolve(this.path)
        })
      }
    })
  }

  async destroy() {
    debug('Destroying temporary video file')
    await fs.unlinkSync(this.path)
    // TODO: also destroy the video file on the android side
  }
}
