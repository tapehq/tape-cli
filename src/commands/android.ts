import { Command, flags } from '@oclif/command'
import { uploadFile } from '../helpers/s3'
import { waitForKeys } from '../helpers/keyboard'
import AndroidScreenshot from '../services/android-screenshot'
import { exec } from 'child_process'
import * as adb from 'adbkit'

export default class Android extends Command {
  static description = 'Record and take screenshots of the Android simulator'

  static examples = [
    `$ yggy android record [screenshot]
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
    const { args, flags } = this.parse(Android)

    const screenshot = new AndroidScreenshot({ verbose: flags.verbose })
    const path = await screenshot.save()
    const url = await uploadFile(path)
    console.log(`Screenshot uploaded! ${url}`)
    screenshot.destroy()
  }
}
