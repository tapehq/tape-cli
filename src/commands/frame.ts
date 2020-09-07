import { flags } from '@oclif/command'
import * as chalk from 'chalk'
import cli from 'cli-ux'
import * as filesize from 'filesize'
import * as fs from 'fs'
import * as mime from 'mime-types'
import * as path from 'path'

import GithubIssueOnErrorCommand from '../github-issue-on-error-command'
import { DeviceOrientation } from '../helpers/orientation.helpers'
import { uploadFile } from '../helpers/s3'
import { commonFlags, copyToLocalOutput } from '../helpers/utils'
import { FfmpegService } from '../services'
import { CopyFormats } from './../helpers/copy.helpers'
import { getFrameOptions } from './../helpers/frame.helpers'
import { randomString } from './../helpers/random'

export default class Frame extends GithubIssueOnErrorCommand {
  static description =
    'Wrap an existing screenshot or video in a device frame (if available) and upload to Tape.sh'

  static aliases = ['frame', 'wrap', 'upload']

  static flags = {
    ...commonFlags,
    hq: flags.boolean({ default: false }),
  }

  static args = [{ name: 'inputFile' }]

  async run() {
    const { flags, args } = this.parse(Frame)

    const { inputFile } = args

    let outputFilePath = inputFile

    const mimeType = mime.lookup(inputFile)
    const fileType = mimeType && mimeType.split('/')[0]

    if (!fileType) {
      this.error('Could not detect file type')
    }

    const frameFlags = {
      noframe: flags.noframe,
      selectframe: flags.selectframe,
      frame: flags.frame,
    }
    const frameOptions = await getFrameOptions(
      outputFilePath,
      fileType,
      frameFlags
    )

    const orientation = DeviceOrientation.Unknown

    cli.action.start(' 📼 Processing your tape')

    const outPathWithoutExtension = `${
      path.parse(args.inputFile).dir || '.'
    }/${randomString()}`

    try {
      // Video mode
      if (fileType === 'video') {
        outputFilePath = await FfmpegService.processVideo(
          inputFile,
          outPathWithoutExtension,
          orientation,
          frameOptions
        )
        cli.action.stop()
      }

      // Gif mode
      if (fileType === 'gif') {
        cli.action.start(' 🚴🏽‍♀️ Making your gif...')

        outputFilePath = await FfmpegService.makeGif(
          inputFile,
          outPathWithoutExtension,
          flags.hq,
          orientation,
          frameOptions
        )

        cli.action.stop('✔️')
      }

      // Image mode
      if (fileType === 'image') {
        outputFilePath = await FfmpegService.processImage(
          inputFile,
          outPathWithoutExtension,
          orientation,
          frameOptions
        )
      }

      if (flags.local) {
        const localFilePath = copyToLocalOutput(outputFilePath, flags.local)
        this.log(`\n 🎉 Video saved locally to ${localFilePath}.`)
      } else {
        this.log(
          `${chalk.grey(
            `Original input file size: ${filesize(fs.statSync(inputFile).size)}`
          )}`
        )

        this.log(
          `${chalk.grey(
            `📼  Tape output file size: ${filesize(
              fs.statSync(outputFilePath).size
            )}`
          )}`
        )

        await uploadFile(outputFilePath, {
          copyToClipboard: !flags.nocopy,
          fileType: 'Video',
          format: flags.format as CopyFormats,
          log: true,
          metadata: {},
        })
      }
    } catch (error) {
      if (flags.debug) {
        this.error(error)
      }
      this.error(`${chalk.dim(error?.message)}`)
    }
  }
}
