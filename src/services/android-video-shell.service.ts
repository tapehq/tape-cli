import { exec, ChildProcess, execSync } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'

import { randomString } from '../helpers/random'
import { Device } from './device.service'
import { debug } from '../services/message.service'

export default class AndroidVideoShell {
  process: ChildProcess | null = null

  fileName: string

  path: string

  device: Device

  pid?: string

  constructor(options: { device: Device }) {
    this.fileName = `${randomString()}-raw.mp4`
    this.path = `${os.tmpdir()}/${this.fileName}`
    this.device = options.device
  }

  record() {
    this.process = exec(`adb -s ${this.device.id} shell screenrecord /sdcard/${this.fileName} --output-format mp4 --verbose`)
    console.log(`Recording started in ${this.path}.`)

    this.pid = execSync(`adb -s ${this.device.id} shell pidof screenrecord`).toString().trim().split(' ')[0]
    debug(`Android screenrecord process spawned. PID: ${this.pid}`)

    this.process.stdout!.on('data', (data) => debug(`stdout: ${data}`))
    this.process.stderr!.on('data', (data) => debug(`stderr: ${data}`))
    this.process.on('error', (error) => debug(`error: ${error.message}`))
  }

  save = async (): Promise<string> => {
    return new Promise((resolve) => {
      debug(`Killing Android screenrecord process. PID: ${this.pid}`)
      execSync(`adb -s ${this.device.id} shell kill -SIGINT ${this.pid}`)

      if (this.process) {
        this.process.on('close', async () => {
          execSync(`adb -s ${this.device.id} pull /sdcard/${this.fileName} ${this.path}`)
          console.log('File saved and ready to upload!')
          resolve(this.path)
        })
      }
    })
  }

  async destroy() {
    debug('Destroying temporary video file')
    await fs.unlinkSync(this.path)

    debug('Destroying temporary video file on Android')
    execSync(`adb -s ${this.device.id} shell rm /sdcard/${this.fileName}`)
  }
}
