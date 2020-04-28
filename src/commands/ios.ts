import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import * as clipboardy from 'clipboardy'

import { uploadFile } from '../helpers/s3'
import { waitForKeys } from '../helpers/keyboard'
import XcodeVideo from '../services/xcode-video'
import XcodeScreenshot from '../services/xcode-screenshot'

export default class Ios extends Command {
  static description = 'Record and take screenshots of the iOS simulator'

  static examples = [
    `$ yggy ios record [screenshot | video]
🎬 Recording started. Press SPACE to save or ESC to abort.
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd' }),
    gif: flags.boolean({ char: 'g', default: false }),
    video: flags.boolean({ char: 'v', default: true }),
    image: flags.boolean({ char: 'i', default: false }),
  }

  async run() {
    const { flags } = this.parse(Ios)

    if (flags.image) {
      const screenshot = new XcodeScreenshot({ verbose: flags.debug })
      const path = await screenshot.save()

      cli.action.start('🔗 Uploading file...')
      const url = await uploadFile(path)
      clipboardy.writeSync(url)
      cli.action.stop(
        `🎉 Screenshot uploaded. Copied URL to clipboard! -> 🔖 ${url}`
      )

      screenshot.destroy()
    } else {
      const video = new XcodeVideo({ verbose: flags.debug })
      video.record()
      console.log(
        '\n 🎬 Recording started. Press SPACE to save or ESC to abort. \n'
      )

      const success = await waitForKeys('space', 'escape')

      const path = await video.save()

      if (success) {
        cli.action.start('🔗 Uploading file...')

        if (flags.gif) {
          console.log('convert to gif')
          // XcodeVideoToGif(path)
          console.log('done')
          // console.log(r)
          //
        } else {
          const url = await uploadFile(path)
          clipboardy.writeSync(url)
          cli.action.stop(`🎉 Video uploaded ->  ${url}`)
        }
      } else {
        console.log(
          '🔥 Escape pressed - stopping the recording and deleting the file'
        )
      }

      video.destroy()
    }
  }
}
