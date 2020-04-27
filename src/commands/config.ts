import { Command, flags } from '@oclif/command'
import { uploadFile } from '../helpers/s3'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

export default class Bucket extends Command {
  static description = 'Upload a file to an S3 bucket'

  static examples = ['$ yggy bucket [file]']

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'name', required: true }]

  async run() {
    const { args } = this.parse(Bucket)
    const { name } = args

    console.log(`Setting bucket name to: ${name}`)

    const homedir = path.join(os.homedir(), '.yggy')
    if (!fs.existsSync(homedir)) {
      fs.mkdirSync(homedir)
    }

    const file = path.join(os.homedir(), '.yggy', 'config.json')
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify({}))
    }

    const content = await fs.readFileSync(file, 'utf8')
    const json = JSON.parse(content)

    fs.writeFileSync(file, JSON.stringify({ bucket: args.name }))

    // JSON.open
  }
}
