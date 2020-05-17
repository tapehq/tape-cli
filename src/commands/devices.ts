import { Command, flags } from '@oclif/command'
import { ConfigService } from '../services'
import { chooseDevicePrompt } from '../helpers/device.helpers'

export default class Devices extends Command {
  static description = 'List devices'

  static examples = ['$ rec devices']

  static flags = {
    help: flags.help({ char: 'h' }),
    clear: flags.boolean({ char: 'c' }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(Devices)

    if (flags.clear) {
      ConfigService.set('device', null)
      console.log('Active device cleared')
      return
    }

    const device = await chooseDevicePrompt()
    ConfigService.set('device', device)
  }
}
