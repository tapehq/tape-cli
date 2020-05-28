import { Command } from '@oclif/command'
import { forEach } from 'lodash'

import { commonFlags } from './../helpers/utils'
import Config from './config'

export default class Login extends Command {
  static description = 'Log in to Tape.sh'

  static examples = ['$ tape login']

  static aliases = ['auth', 'authorize']

  async run() {
    await Config.run(['--login'])
  }
}
