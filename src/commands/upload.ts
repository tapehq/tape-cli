import { Command, flags } from '@oclif/command'
import { uploadFile } from '../helpers/s3'

export default class Upload extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ iggy upload
hello world from ./src/hello.ts!
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    name: flags.string({ char: 'n', description: 'name to print' }),
  }

  static args = [{ name: 'file', required: true }]

  async run() {
    const { args, flags } = this.parse(Upload)

    const url = await uploadFile(args.file)
    console.log(url)
  }
}
