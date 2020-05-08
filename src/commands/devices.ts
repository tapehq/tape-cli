import { Command, flags } from '@oclif/command'
import { getDevices as getIosDevices } from '../services/xcode-devices'
import { getDevices as getAndroidDevices } from '../services/android-devices'

export default class Devices extends Command {
  static description = 'List devices'

  static examples = ['$ yggy devices']

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    const devices = await getIosDevices()
    console.log(devices)
    const androidDevices = await getAndroidDevices()
    console.log(androidDevices)
  }
}
