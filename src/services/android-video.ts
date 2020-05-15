import { spawn, ChildProcess, exec, execSync } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'
import * as filesize from 'filesize'

import { randomString } from '../helpers/random'

import * as path from 'path'
import { BIN_DIR } from './config.service'
const FFMPEG = path.join(BIN_DIR, 'ffmpeg')

export default class AndroidVideo {
  process: ChildProcess | null = null

  fileName: string

  path: string

  verbose: boolean

  constructor(options: { verbose: boolean }) {
    this.fileName = `${randomString()}`
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

    // [
    //     'shell',
    //     'screenrecord',
    //     '--bit-rate',
    //     '10M',
    //     '--output-format',
    //     '=h264',
    //     '-',
    //     '>',
    //     `${this.path}.raw`,
    //   ]

    this.log(`Recording started in ${this.path}.`)

    this.process.stdout.on('data', (data) => {
      console.log(`[process] stdout: ${data}`)
    })

    this.process.stderr.on('data', (data) => {
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
          console.log(`process code ${code}`)
          // if (code === 0) {
          //   await new Promise((resolve) => setTimeout(resolve, 2000))
          execSync(`adb pull /sdcard/output.raw ${this.path}.raw`)
          this.log('[process] File saved and ready to upload!')

          const OUTPUT_FILE = `${this.path}.mp4`

          execSync(
            `${FFMPEG} -vcodec h264 -i ${this.path}.raw -vcodec copy -acodec copy ${OUTPUT_FILE}`
          )
          resolve(OUTPUT_FILE)
          // } else {
          //   this.log('[process] process died unsuccessfully')
          //   console.log(`xxx - code`, code)
          //   reject()
          // }
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
