import { Command, flags } from '@oclif/command'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { getDevices as getIosDevices } from '../services/xcode-devices'
import { getDevices as getAndroidDevices } from '../services/android-devices'

export default class Devices extends Command {
  static description = 'Set bucket name'

  static examples = ['$ yggy config [S3 bucket namee]']

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    const { args } = this.parse(Devices)
    const { name } = args

    const devices = await getIosDevices()
    console.log(devices)
    const androidDevices = await getAndroidDevices()
    console.log(androidDevices)
  }
}
