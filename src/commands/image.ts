import { frameFromSelectorPrompt } from './../helpers/frame.helpers'
import * as chalk from 'chalk'
import { fetchDeviceFrame } from '../api/frame'
import GithubIssueOnErrorCommand from '../github-issue-on-error-command'
import { CopyFormats } from '../helpers/copy.helpers'
import { deviceToFriendlyString } from '../helpers/device.helpers'
import { getDeviceOrientation } from '../helpers/orientation.helpers'
import { uploadFile } from '../helpers/s3'
import { commonFlags, copyToLocalOutput } from '../helpers/utils'
import {
  AndroidScreenshotService,
  DeviceService,
  XcodeScreenshotService,
  ConfigService,
} from '../services'
import { processImage } from '../services/ffmpeg.service'
import { getDimensions } from './../services/ffmpeg.service'

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

    const orientation = await getDeviceOrientation(device)

    let frameOptions = null

    const recordingSettings = await ConfigService.getRecordingSettings()

    if (!flags.noframe || recordingSettings.deviceFraming) {
      const dimensions = await getDimensions(rawOutputFile)

      const allFrames = await fetchDeviceFrame({
        ...dimensions,
        type: 'image',
      })

      if (allFrames) {
        if (allFrames.length > 1 && flags.selectframe) {
          frameOptions = await frameFromSelectorPrompt(allFrames)
        } else {
          frameOptions = allFrames[0]
        }
      }
    }

    const outputFilePathWithoutExtension = rawOutputFile.replace('-raw.png', '')

    const outputFilePath = await processImage(
      rawOutputFile,
      outputFilePathWithoutExtension,
      orientation,
      frameOptions
    )

    if (flags.local) {
      const localFilePath = copyToLocalOutput(outputFilePath, flags.local)
      this.log(`\n 🎉 Saved locally to ${localFilePath}.`)
    } else {
      try {
        await uploadFile(outputFilePath, {
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
