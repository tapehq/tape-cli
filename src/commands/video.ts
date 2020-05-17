import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import * as clipboardy from 'clipboardy'
import * as filesize from 'filesize'
import * as fs from 'fs'

import { uploadFile } from '../helpers/s3'
import {
  DeviceService,
  FfmpegService,
  XcodeVideoService,
  AndroidVideoService,
} from '../services'
import { deviceToFriendlyString } from '../helpers/device.helpers'
import { waitForKeys } from '../helpers/keyboard'

export default class Video extends Command {
  static description = 'Record iOS/Android devices/simulators'

  static examples = [
    `$ rec video [--hq | --gif | --local]
🎬 Recording started. Press SPACE to save or ESC to abort.
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd' }),
    gif: flags.boolean({ char: 'g', default: false }),
    video: flags.boolean({ char: 'v', default: true }),
    hq: flags.boolean({ default: false }),
    local: flags.boolean({ char: 'l' }), // dont upload
  }

  async run() {
    const { flags } = this.parse(Video)

    const device = await DeviceService.getActiveDevice()

    if (!device) return

    console.log(`📱 Device: ${deviceToFriendlyString(device)}`)

    const VideoKlass =
      device.type === 'android' ? AndroidVideoService : XcodeVideoService

    const video = new VideoKlass({ device, verbose: flags.debug })
    video.record()
    console.log(
      '\n 🎬 Recording started. Press SPACE to save or ESC to abort. \n'
    )

    const success = await waitForKeys('space', 'escape')

    const rawOutputFile = await video.save()

    let outputPath = rawOutputFile

    if (flags.hq && !flags.gif) {
      console.info('ℹ hq flag supplied. Not Compressing \n')
    } else {
      outputPath = rawOutputFile.replace('.mp4', '-compressed.mp4')
      await FfmpegService.compressVid(rawOutputFile, outputPath)
    }

    if (flags.gif) {
      cli.action.start('🚴🏽‍♀️ Making your gif...')

      const gifPath = rawOutputFile.replace('.mp4', '')
      await FfmpegService.makeGif(rawOutputFile, gifPath)
      outputPath = `${gifPath}.gif`

      cli.action.stop('✔️')
    }

    if (success) {
      if (flags.local) {
        clipboardy.writeSync(outputPath)
        console.log('🎉 Video saved locally. Path in your clipboard')
      } else {
        cli.action.start('🔗 Uploading file...')

        console.log(
          `Xcode file size: ${filesize(fs.statSync(rawOutputFile).size)}`
        )

        console.log(
          `Output file size: ${filesize(fs.statSync(outputPath).size)}`
        )

        const url = await uploadFile(outputPath, {
          copyToClipboard: true,
          log: true,
          fileType: 'Video',
        })
        clipboardy.writeSync(url)
        cli.action.stop(
          `🎉 Uploaded. URL is in your clipboard 📋 ->  \n ${url}`
        )
      }
    } else {
      console.log(
        '🔥 Escape pressed - stopping the recording and deleting the file'
      )
    }

    video.destroy()
  }
}
