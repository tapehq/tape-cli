import { execSync } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'
import * as chalk from 'chalk'

import { randomString } from '../helpers/random'
import { Device } from './device.service'
import { getFfmpegBin } from './ffmpeg.service'

export default class AndroidVideoEmu {
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

  record({ retrying } = { retrying: false }) {
    const result = this.adbStart()
    if (result === 'KO: Recording has already started') {
      if (retrying) {
        console.log(chalk.red('😥 ADB is still reporting that a recording is already in progress. Aborting!'))
        throw new Error('ADB recording already in progreess, cannot proceed')
      } else {
        console.log(chalk.yellow('Warning: Recording already in progress. Stopping current recording and retrying.'))
        this.adbStop()
        this.record({ retrying: true })
      }
    } else if (result !== 'OK') {
      console.log(chalk.yellow('😱 WARNING: unexpected data received from Android Emulator.'))
      console.log(chalk.dim(result))
    }

    this.log(`Recording started in ${this.path}.`)
  }

  save = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (this.adbStop() === 'OK') {
        this.log('File saved and ready to upload!')
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
  }

  private adbStart() {
    return execSync(
      `adb -s ${this.device.id} emu screenrecord start ${this.path}.webm`
    ).toString().trim()
  }

  private adbStop() {
    return execSync(
      `adb -s ${this.device.id} emu screenrecord stop`
    ).toString().trim()
  }

  private log(text: string) {
    if (this.verbose) {
      console.log(`[android-video-emu] ${text}`)
    }
  }
}
