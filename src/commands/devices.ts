import { Command, flags } from '@oclif/command'
import { ConfigService } from '../services'
import { chooseDevicePrompt } from '../helpers/device.helpers'

export default class Devices extends Command {
  static description = 'List devices'

  static examples = ['$ tape devices']

  static aliases = ['device', 'emu', 'sims']

  static flags = {
    help: flags.help({ char: 'h' }),
    clear: flags.boolean({ char: 'c' }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(Devices)

    if (flags.clear) {
      ConfigService.set('device', null)
      this.log('Active device cleared')
      return
    }

    const device = await chooseDevicePrompt(true)
    ConfigService.set('device', device)
  }
}
