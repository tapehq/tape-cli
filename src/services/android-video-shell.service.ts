import { exec, ChildProcess, execSync } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'

import { randomString } from '../helpers/random'
import { Device } from './device.service'

export default class AndroidVideoShell {
  process: ChildProcess | null = null

  fileName: string

  path: string

  verbose: boolean

  device: Device

  pid?: string

  constructor(options: { device: Device; verbose?: boolean }) {
    this.fileName = `${randomString()}-raw.mp4`
    this.path = `${os.tmpdir()}/${this.fileName}`
    this.device = options.device
    this.verbose = options.verbose || false
  }

  record() {
    this.process = exec(`adb -s ${this.device.id} shell screenrecord /sdcard/${this.fileName} --output-format mp4 --verbose`)
    console.log(`Recording started in ${this.path}.`)

    this.pid = execSync(`adb -s ${this.device.id} shell pidof screenrecord`).toString().trim().split(' ')[0]
    this.log(`Android screenrecord process spawned. PID: ${this.pid}`)

    this.process.stdout!.on('data', (data) => this.log(`stdout: ${data}`))
    this.process.stderr!.on('data', (data) => this.log(`stderr: ${data}`))
    this.process.on('error', (error) => this.log(`error: ${error.message}`))
  }

  save = async (): Promise<string> => {
    return new Promise((resolve) => {
      this.log(`Killing Android screenrecord process. PID: ${this.pid}`)
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
    this.log('Destroying temporary video file')
    await fs.unlinkSync(this.path)

    this.log('Destroying temporary video file on Android')
    execSync(`adb -s ${this.device.id} shell rm /sdcard/${this.fileName}`)
  }

  private log(text: string) {
    if (this.verbose) {
      console.log(`[android-video-shell] ${text}`)
    }
  }
}
