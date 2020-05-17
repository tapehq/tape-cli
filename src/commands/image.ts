import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import * as clipboardy from 'clipboardy'
import * as chalk from 'chalk'

import { uploadFile } from '../helpers/s3'
import {
  AndroidScreenshotService,
  XcodeScreenshotService,
  DeviceService,
} from '../services'
import { deviceToFriendlyString } from '../helpers/device.helpers'

export default class Image extends Command {
  static description = 'Take screenshots of iOS/Android devices/simulators'

  static examples = [
    `$ rec image
🎉 Screenshot uploaded. Copied URL to clipboard 🔖 ! -> \n https://example.com/image.png
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd' }),
    local: flags.boolean({ char: 'l' }), // dont upload
  }

  async run() {
    const { flags } = this.parse(Image)

    const device = await DeviceService.getActiveDevice()

    if (!device) return

    console.log(`📱 Device: ${deviceToFriendlyString(device)}`)

    const ScreenshotKlass =
      device.type === 'android'
        ? AndroidScreenshotService
        : XcodeScreenshotService
    const screenshot = new ScreenshotKlass({ verbose: flags.debug })
    const path = await screenshot.save()

    if (flags.local) {
      clipboardy.writeSync(path)
      console.log('🎉 Screenshot saved locally. Path in your clipboard')
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
