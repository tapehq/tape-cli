import { Command, flags } from '@oclif/command'
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
    verbose: flags.boolean({ char: 'v' }),
    gif: flags.boolean({ char: 'g', default: false }),
  }

  static args = [
    { name: 'type', required: true, options: ['video', 'screenshot'] },
  ]

  async run() {
    const { args, flags } = this.parse(Ios)

    if (args.type === 'screenshot') {
      const screenshot = new XcodeScreenshot({ verbose: flags.verbose })
      const path = await screenshot.save()
      const url = await uploadFile(path)
      console.log(`Screenshot uploaded! ${url}`)
      screenshot.destroy()
    } else {
      const video = new XcodeVideo({ verbose: flags.verbose })
      video.record()
      console.log('🎬 Recording started. Press SPACE to save or ESC to abort.')

      const success = await waitForKeys('space', 'escape')

      const path = await video.save()

      if (success) {
        console.log('🔗 Uploading file...')

        if (flags.gif) {
          console.log('convert to gif')
          // XcodeVideoToGif(path)
          console.log('done')
          // console.log(r)
          //
        } else {
          const url = await uploadFile(path)
          console.log(`✅ Video uploaded: ${url}`)
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
