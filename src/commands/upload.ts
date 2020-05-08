import { Command, flags } from '@oclif/command'
import { uploadFile } from '../helpers/s3'

export default class Upload extends Command {
  static description = 'Upload a file to an S3 bucket'

  static examples = ['$ rec upload [file]']

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'file', required: true }]

  async run() {
    const { args } = this.parse(Upload)

    const url = await uploadFile(args.file)
    console.log(url)
  }
}
