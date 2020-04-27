import { Command, flags } from '@oclif/command'
import { uploadFile } from '../helpers/s3'
import { waitForSpace, waitForKeys } from '../helpers/keyboard'
import XcodeVideo from '../services/xcode-video'
import XcodeScreenshot from '../services/xcode-screenshot'

export default class Ios extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ iggy ios record
hello world from ./src/hello.ts!
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    verbose: flags.boolean({ char: 'v' }),
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

        const url = await uploadFile(path)
        console.log(`✅ Video uploaded: ${url}`)
      } else {
        console.log(
          '🔥 Escape pressed - stopping the recording and deleting the file'
        )
      }

      video.destroy()
    }
  }
}
