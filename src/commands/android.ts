import { Command, flags } from '@oclif/command'
import { uploadFile } from '../helpers/s3'
import AndroidScreenshot from '../services/android-screenshot'

export default class Android extends Command {
  static description = 'Record and take screenshots of the Android simulator'

  static examples = [
    `$ yggy android [--video | --gif | --image]
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
    const { flags } = this.parse(Android)

    if (!flags.image) {
      console.error('TODO: android video not implemented yet')
      return
    }

    const screenshot = new AndroidScreenshot({ verbose: flags.debug })
    const path = await screenshot.save()
    const url = await uploadFile(path)
    console.log(`Screenshot uploaded! ${url}`)
    screenshot.destroy()
  }
}
