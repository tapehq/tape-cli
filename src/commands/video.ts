import { CopyFormats } from './../helpers/copy.helpers'
import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import * as filesize from 'filesize'
import * as fs from 'fs'
import * as chalk from 'chalk'

import { uploadFile } from '../helpers/s3'
import {
  DeviceService,
  FfmpegService,
  XcodeVideoService,
  AndroidVideoService,
} from '../services'
import { deviceToFriendlyString } from '../helpers/device.helpers'
import { waitForKeys } from '../helpers/keyboard'
import { copyToLocalOutput, commonFlags } from '../helpers/utils'

export default class Video extends Command {
  static description = 'Record iOS/Android devices/simulators'

  static examples = [
    `$ tape video [--hq | --gif | --local $OUTPUTPATH]
🎬 Recording started. Press SPACE to save or ESC to abort.
`,
  ]

  static aliases = ['video', 'vid', 'm']

  static flags = {
    ...commonFlags,
    gif: flags.boolean({ char: 'g', default: false }),
    hq: flags.boolean({ default: false }),
  }

  async run() {
    const { flags } = this.parse(Video)

    const device = await DeviceService.getActiveDevice()

    if (!device) return

    this.log(` 📱 Device: ${deviceToFriendlyString(device)}`)

    const VideoKlass =
      device.type === 'android' ? AndroidVideoService : XcodeVideoService

    const video = new VideoKlass({ device, verbose: flags.debug })
    video.record()
    cli.action.start(
      ' 🎬 Recording started. Press SPACE to save or ESC to abort.'
    )

    const success = await waitForKeys('space', 'escape')

    cli.action.stop()

    const rawOutputFile = await video.save()

    let outputPath = rawOutputFile

    if (flags.hq && !flags.gif) {
      this.log(' ℹ hq flag supplied. Not Compressing \n')
    } else {
      outputPath = rawOutputFile.replace('-raw.mp4', '.mp4')
      await FfmpegService.compressVid(rawOutputFile, outputPath)
    }

    if (flags.gif) {
      cli.action.start(' 🚴🏽‍♀️ Making your gif...')

      const gifPath = rawOutputFile.replace('-raw.mp4', '')
      await FfmpegService.makeGif(rawOutputFile, gifPath)
      outputPath = `${gifPath}.gif`

      cli.action.stop('✔️')
    }

    if (success) {
      if (flags.local) {
        const localFilePath = copyToLocalOutput(outputPath, flags.local)
        this.log(`\n 🎉 Video saved locally to ${localFilePath}.`)
      } else {
        this.log(
          `${chalk.grey(
            `Original file size: ${filesize(fs.statSync(rawOutputFile).size)}`
          )}`
        )

        this.log(
          `${chalk.grey(
            `📼  Tape output file size: ${filesize(
              fs.statSync(outputPath).size
            )}`
          )}`
        )

        try {
          await uploadFile(outputPath, {
            copyToClipboard: !flags.nocopy,
            log: true,
            fileType: 'Video',
            format: flags.format as CopyFormats,
          })
        } catch (error) {
          this.error(error)
          cli.action.stop('💥 Something went wrong')
        }
      }
    } else {
      this.log(
        '🔥 Escape pressed - stopping the recording and deleting the file'
      )
    }

    video.destroy()
  }
}
