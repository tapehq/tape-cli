import { Command, flags } from '@oclif/command'
import * as open from 'open'

import { TAPE_HOST } from './../services/config.service'

export default class Upgrade extends Command {
  static description = 'Opens a direct link to upgrade your Tape.sh plan'

  static flags = {
    help: flags.help({ char: 'h' }),
    plan: flags.string({
      char: 'p',
      description: 'Plan name to upgrade to',
      default: 'Pro',
    }),
  }

  async run() {
    const { flags } = this.parse(Upgrade)

    const planName = flags.plan

    await open(`${TAPE_HOST}/dashboard/profile?subscribe=${planName}`)
  }
}
