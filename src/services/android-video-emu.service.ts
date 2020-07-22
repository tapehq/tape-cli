import { execSync } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'

import { randomString } from '../helpers/random'
import { Device } from './device.service'
import { getFfmpegBin } from './ffmpeg.service'
import { log, debug, error, warn, MessageStyle } from '../services/message.service'

export default class AndroidVideoEmu {
  fileName: string

  path: string

  device: Device

  constructor(options: { device: Device }) {
    this.fileName = `${randomString()}-raw.mp4`
    this.path = `${os.tmpdir()}/${this.fileName}`
    this.device = options.device
  }

  record({ retrying } = { retrying: false }) {
    const result = this.adbStart()
    if (result === 'KO: Recording has already started') {
      if (retrying) {
        error('😥 ADB is still reporting that a recording is already in progress. Aborting!')
        throw new Error('ADB recording already in progreess, cannot proceed')
      } else {
        warn('Warning: Recording already in progress. Stopping current recording and retrying.')
        this.adbStop()
        this.record({ retrying: true })
      }
    } else if (result !== 'OK') {
      error('unexpected data received from Android Emulator')
      log(result, MessageStyle.Dim)
    }

    debug(`Recording started in ${this.path}.`)
  }

  save = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (this.adbStop() === 'OK') {
        debug('File saved and ready to upload!')
      }

      execSync(
        `${getFfmpegBin()} -i ${this.path}.webm -crf 26 ${this.path}`
      )

      resolve(this.path)
    })
  }

  async destroy() {
    debug('Destroying temporary video file')
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
}
