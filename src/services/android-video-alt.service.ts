import { execSync } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'

import { randomString } from '../helpers/random'
import { Device } from './device.service'
import { getFfmpegBin } from './ffmpeg.service'

export default class AndroidVideo {
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
    const rawResult = execSync(
      `adb -s ${this.device.id} emu screenrecord start ${this.path}.webm`
    )
    const result = rawResult.toString().trim()
    if (result === 'KO: Recording has already started') {
      console.log('Warning: Recording already in progress')
    } else if (result === 'OK') {
      console.log('result ok')
    } else {
      console.log(`unknown result: ${result}`)
    }

    this.log(`Recording started in ${this.path}.`)
  }

  save = async (): Promise<string> => {
    return new Promise((resolve) => {
      const rawResult = execSync(
        `adb -s ${this.device.id} emu screenrecord stop`
      )
      const result = rawResult.toString().trim()
      console.log(result)
      console.log(this.path)
      if (result === 'OK') {
        console.log('done')
      }

      execSync(
        `${getFfmpegBin()} -i ${this.path}.webm -crf 26 ${this.path}`
      )

      resolve(this.path)
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
