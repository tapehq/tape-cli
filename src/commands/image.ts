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
    const path = await screenshot.save()

    if (flags.local) {
      const localFilePath = copyToLocalOutput(path, flags.local)
      this.log(`\n 🎉 Saved locally to ${localFilePath}.`)
    } else {
      try {
        await uploadFile(path, {
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
