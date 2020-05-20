import { commonFlags } from './../helpers/utils'
import { Command, flags } from '@oclif/command'

import { uploadFile } from '../helpers/s3'
import {
  AndroidScreenshotService,
  XcodeScreenshotService,
  DeviceService,
} from '../services'
import { deviceToFriendlyString } from '../helpers/device.helpers'
import { copyToLocalOutput } from '../helpers/utils'

export default class Image extends Command {
  static description = 'Take screenshots of iOS/Android devices/simulators'

  static examples = [
    `$ tape image
🎉 Screenshot uploaded. Copied URL to clipboard 🔖 ! -> \n https://example.com/image.png
`,
  ]

  static flags = commonFlags

  static aliases = ['i', 'screenshot']

  async run() {
    const { flags } = this.parse(Image)

    const device = await DeviceService.getActiveDevice()

    if (!device) return

    this.log(`📱 Device: ${deviceToFriendlyString(device)}`)

    const ScreenshotKlass =
      device.type === 'android' ?
        AndroidScreenshotService :
        XcodeScreenshotService
    const screenshot = new ScreenshotKlass({ device, verbose: flags.debug })
    const path = await screenshot.save()

    if (flags.local) {
      const localFilePath = copyToLocalOutput(path, flags.local)
      this.log(`\n 🎉 Video saved locally to ${localFilePath}.`)
    } else {
      await uploadFile(path, {
        copyToClipboard: true,
        log: true,
        fileType: 'Screenshot',
      })
      screenshot.destroy()
    }
  }
}
