import { Command, flags } from '@oclif/command'
import { uploadFile } from '../helpers/s3'
import AndroidScreenshot from '../services/android-screenshot'

import AndroidVideo from '../services/android-video'
import cli from 'cli-ux'
import * as clipboardy from 'clipboardy'
import { waitForKeys } from '../helpers/keyboard'

export default class Android extends Command {
  static description = 'Record and take screenshots of the Android simulator'

  static examples = [
    `$ rec android [--video | --gif | --image]
🎬 Recording started. Press SPACE to save or ESC to abort.
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd' }),
    gif: flags.boolean({ char: 'g', default: false }),
    video: flags.boolean({ char: 'v', default: true }),
    image: flags.boolean({ char: 'i', default: false }),
    hq: flags.boolean({ default: false }),
  }

  async run() {
    const { flags } = this.parse(Android)

    if (flags.image) {
      const screenshot = new AndroidScreenshot({ verbose: flags.debug })
      const path = await screenshot.save()
      const url = await uploadFile(path)
      console.log(`Screenshot uploaded! ${url}`)
      screenshot.destroy()
    } else {
      const video = new AndroidVideo({ verbose: flags.debug })
      video.record()
      console.log(
        '\n 🎬 Recording started. Press SPACE to save or ESC to abort. \n'
      )

      const success = await waitForKeys('space', 'escape')
      console.log('done')
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const path = await video.save()

      console.log('----- path ----- ', path)

      cli.action.start('🔗 Uploading file...')

      const url = await uploadFile(path)
      clipboardy.writeSync(url)
      cli.action.stop(`🎉 Uploaded. URL is in your clipboard 📋 ->  \n ${url}`)

      //   video.destroy()
    }
  }
}
