import { flags } from '@oclif/command'
import * as chalk from 'chalk'
import cli from 'cli-ux'
import * as filesize from 'filesize'
import * as fs from 'fs'
import GithubIssueOnErrorCommand from '../github-issue-on-error-command'
import { deviceToFriendlyString } from '../helpers/device.helpers'
import { waitForKeys } from '../helpers/keyboard'
import { getDeviceOrientation } from '../helpers/orientation.helpers'
import { uploadFile } from '../helpers/s3'
import { commonFlags, copyToLocalOutput } from '../helpers/utils'
import {
  AndroidVideoEmuService,
  AndroidVideoShellService,
  ConfigService,
  DeviceService,
  FfmpegService,
  XcodeVideoService,
} from '../services'
import { CopyFormats } from './../helpers/copy.helpers'
import { getFrameOptions } from './../helpers/frame.helpers'

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
  }

  async run() {
    const { flags } = this.parse(Video)

    const device = await DeviceService.getActiveDevice()

    if (!device) return

    this.log(` 📱 Device: ${deviceToFriendlyString(device)}`)

    let VideoKlass

    if (device.type === 'android') {
      if (device.isEmulator) {
        VideoKlass = AndroidVideoEmuService
      } else {
        VideoKlass = AndroidVideoShellService
      }
    } else {
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
      let outputFilePath = rawOutputFile

      const recordingSettings = await ConfigService.getRecordingSettings()
      const frameFlags = {
        noframe: false,
        selectframe: flags.selectframe,
        frame: flags.frame,
      }
      const frameOptions = await getFrameOptions(
        outputFilePath,
        'video',
        frameFlags,
        recordingSettings
      )
      const orientation = await getDeviceOrientation(device)
      const outPathWithoutExtension = rawOutputFile.replace('-raw.mp4', '')

      try {
        // Video mode
        if (!flags.gif) {
          outputFilePath = await FfmpegService.processVideo(
            rawOutputFile,
            outPathWithoutExtension,
            orientation,
            frameOptions
          )
          cli.action.stop()
        }

        // Gif mode
        if (flags.gif) {
          cli.action.start(' 🚴🏽‍♀️ Making your gif...')

          outputFilePath = await FfmpegService.makeGif(
            rawOutputFile,
            outPathWithoutExtension,
            flags.hq,
            orientation,
            frameOptions
          )

          cli.action.stop('✔️')
        }

        if (flags.local) {
          const localFilePath = copyToLocalOutput(outputFilePath, flags.local)
          this.log(`\n 🎉 Video saved locally to ${localFilePath}.`)
        } else {
          this.log(
            `${chalk.grey(
              `Original video file size: ${filesize(
                fs.statSync(rawOutputFile).size
              )}`
            )}`
          )

          this.log(
            `${chalk.grey(
              `📼  Tape output file size: ${filesize(
                fs.statSync(outputFilePath).size
              )}`
            )}`
          )

          await uploadFile(outputFilePath, {
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

    video.destroy()
  }
}
