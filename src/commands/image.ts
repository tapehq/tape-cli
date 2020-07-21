import * as chalk from 'chalk'

import GithubIssueOnErrorCommand from '../github-issue-on-error-command'
import { uploadFile } from '../helpers/s3'
import {
  AndroidScreenshotService,
  XcodeScreenshotService,
  DeviceService,
} from '../services'
import { deviceToFriendlyString } from '../helpers/device.helpers'
import { copyToLocalOutput, commonFlags } from '../helpers/utils'
import { CopyFormats } from '../helpers/copy.helpers'
import {
  DeviceOrientation,
  getDeviceOrientation,
} from '../helpers/orientation.helpers'
import { rotateImage } from '../services/ffmpeg.service'

export default class Image extends GithubIssueOnErrorCommand {
  static description = 'Take screenshots of iOS/Android devices/simulators'

  static examples = [
    `$ tape image
🎉 Screenshot uploaded. Copied URL to clipboard 🔖 ! -> \n https://example.com/image.png
`,
  ]

  static flags = commonFlags

  static aliases = ['i', 'screenshot', 'img']

  async run() {
    const { flags } = this.parse(Image)

    const device = await DeviceService.getActiveDevice()

    if (!device) return
    this.log(`📱 Device: ${deviceToFriendlyString(device)}`)

    const ScreenshotKlass =
      device.type === 'android'
        ? AndroidScreenshotService
        : XcodeScreenshotService

    const screenshot = new ScreenshotKlass({ device, verbose: flags.debug })
    const rawOutputFile = await screenshot.save()

    let outputFile = rawOutputFile

    const orientation = await getDeviceOrientation(device)
    if (
      orientation !== DeviceOrientation.Portrait &&
      orientation !== DeviceOrientation.Unknown
    ) {
      outputFile = rawOutputFile.replace('-raw.png', '.png')

      await rotateImage(rawOutputFile, `${outputFile}`, orientation)
      outputFile = `${outputFile}`
    }

    if (flags.local) {
      const localFilePath = copyToLocalOutput(outputFile, flags.local)
      this.log(`\n 🎉 Saved locally to ${localFilePath}.`)
    } else {
      try {
        await uploadFile(outputFile, {
          copyToClipboard: !flags.nocopy,
          fileType: 'Screenshot',
          format: flags.format as CopyFormats,
          log: true,
          metadata: {
            os: device.type,
            deviceName: device.name,
            deviceId: device.id,
          },
        })
      } catch (error) {
        if (flags.debug) {
          this.error(error)
        }
        this.error(`${chalk.dim(error?.message)}`)
      }
      screenshot.destroy()
    }
  }
}
