import { execSync } from 'child_process'
import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import * as clipboardy from 'clipboardy'
import * as filesize from 'filesize'
import * as fs from 'fs'

import { uploadFile } from '../helpers/s3'
import { waitForKeys } from '../helpers/keyboard'
import XcodeVideo from '../services/xcode-video'
import XcodeScreenshot from '../services/xcode-screenshot'

export default class Ios extends Command {
  static description = 'Record and take screenshots of the iOS simulator'

  static examples = [
    `$ rec ios record [--image | --video | --gif]
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
    const { flags } = this.parse(Ios)

    if (flags.image) {
      const screenshot = new XcodeScreenshot({ verbose: flags.debug })
      const path = await screenshot.save()

      cli.action.start('🔗 Uploading file...')
      const url = await uploadFile(path)
      clipboardy.writeSync(url)
      cli.action.stop(
        `🎉 Screenshot uploaded. Copied URL to clipboard 🔖 ! -> \n ${url}`
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

      let outputPath = path

      if (flags.hq && !flags.gif) {
        console.info('ℹ hq flag supplied. Not Compressing \n')
      } else {
        outputPath = path.replace('.mp4', '-compressed.mp4')
        execSync(`ffmpeg -i ${path} -vcodec h264 -an -b:v 800k ${outputPath}`)
      }

      if (success) {
        cli.action.start('🔗 Uploading file...')

        if (flags.gif) {
          const gifPath = path.replace('.mp4', '')
          execSync(
            `ffmpeg -i ${path} -filter_complex 'fps=10,scale=320:-1:flags=lanczos,split [o1] [o2];[o1] palettegen [p]; [o2] fifo [o3];[o3] [p] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle' ${gifPath}.gif`
          )
          outputPath = `${gifPath}.gif`
        }

        console.log(`Xcode file size: ${filesize(fs.statSync(path).size)}`)

        console.log(
          `Output file size: ${filesize(fs.statSync(outputPath).size)}`
        )

        const url = await uploadFile(outputPath)
        clipboardy.writeSync(url)
        cli.action.stop(
          `🎉 Uploaded. URL is in your clipboard 📋 ->  \n ${url}`
        )
      } else {
        console.log(
          '🔥 Escape pressed - stopping the recording and deleting the file'
        )
      }

      video.destroy()
    }
  }
}
