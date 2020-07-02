import { Command, flags } from '@oclif/command'
import * as open from 'open'

import { TAPE_HOST } from './../services/config.service'

export default class Upgrade extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    plan: flags.string({ char: 'p', description: 'Plan name to upgrade to' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(Upgrade)

    const planName = flags.plan ?? 'Pro'

    await open(`${TAPE_HOST}/dashboard/profile?subscribe=${planName}`)
  }
}
