import { Command, flags } from '@oclif/command'
import { install } from '../helpers/ffmpeg'

export default class Ffmpeg extends Command {
  static description = 'Install ffmpeg'

  static examples = ['$ rec ffmpeg']

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    const { args } = this.parse(Ffmpeg)
    const { name } = args
    install()
  }
}
