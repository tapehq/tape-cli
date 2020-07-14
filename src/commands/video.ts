import { CopyFormats } from './../helpers/copy.helpers'
import { flags } from '@oclif/command'
import cli from 'cli-ux'
import * as filesize from 'filesize'
import * as fs from 'fs'
import * as chalk from 'chalk'

import GithubIssueOnErrorCommand from '../github-issue-on-error-command'
import { uploadFile } from '../helpers/s3'
import {
  DeviceService,
  FfmpegService,
  XcodeVideoService,
  AndroidVideoService,
  AndroidVideoLegacyService,
} from '../services'
import { deviceToFriendlyString } from '../helpers/device.helpers'
import { waitForKeys } from '../helpers/keyboard'
import { copyToLocalOutput, commonFlags } from '../helpers/utils'
import { getDeviceOrientation } from '../helpers/orientation.helpers'

export default class Video extends GithubIssueOnErrorCommand {
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
    legacy: flags.boolean({ default: false }),
  }

  async run() {
    const { flags } = this.parse(Video)

    const device = await DeviceService.getActiveDevice()

    if (!device) return

    this.log(` 📱 Device: ${deviceToFriendlyString(device)}`)

    let VideoKlass

    if (device.type === 'android') {
      if (flags.legacy) {
        this.log('Legacy Android flag detected.')
        VideoKlass = AndroidVideoLegacyService
      } else {
        VideoKlass = AndroidVideoService
      }
    } else {
      if (flags.legacy) {
        this.log('Legacy flag is android only and has been ignored.')
      }
      VideoKlass = XcodeVideoService
    }

    const video = new VideoKlass({ device, verbose: flags.debug })
    video.record()
    cli.action.start(
      ' 🎬 Recording started. Press SPACE to save or ESC to abort.'
    )

    const success = await waitForKeys('space', 'escape')

    cli.action.start(' 📼 Processing your tape')

    const rawOutputFile = await video.save()

    if (success) {
      let outputPath = rawOutputFile

      const orientation = getDeviceOrientation(device)

      try {
        if (flags.hq && !flags.gif) {
          this.log(' ℹ hq flag supplied. Not Compressing \n')
        } else {
          outputPath = rawOutputFile.replace('-raw.mp4', '.mp4')
          await FfmpegService.compressVid(
            rawOutputFile,
            outputPath,
            orientation
          )
          cli.action.stop()
        }

        if (flags.gif) {
          cli.action.start(' 🚴🏽‍♀️ Making your gif...')

          const gifPath = rawOutputFile.replace('-raw.mp4', '')
          await FfmpegService.makeGif(
            rawOutputFile,
            gifPath,
            flags.hq,
            orientation
          )
          outputPath = `${gifPath}.gif`

          cli.action.stop('✔️')
        }

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

          await uploadFile(outputPath, {
            copyToClipboard: !flags.nocopy,
            fileType: 'Video',
            format: flags.format as CopyFormats,
            log: true,
            metadata: {
              os: device.type,
              deviceName: device.name,
              deviceId: device.id,
            },
          })
        }
      } catch (error) {
        if (flags.debug) {
          this.error(error)
        }
        this.error(`${chalk.dim(error?.message)}`)
      }
    } else {
      this.log(
        '🔥 Escape pressed - stopping the recording and deleting the file'
      )
    }

    if (!flags.local) {
      video.destroy()
    }
  }
}
