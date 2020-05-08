import { install } from './../helpers/ffmpeg'
import { Command, flags } from '@oclif/command'
import * as inquirer from 'inquirer'
import * as chalk from 'chalk'

import config, { bucketName } from '../services/config'

export default class Config extends Command {
  static description = 'Configuration'

  static examples = ['$ yggy config']

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'name', required: false }]

  async run() {
    this.parse(Config)

    const responses = await inquirer.prompt([
      {
        name: 'stage',
        message: 'config',
        type: 'list',
        choices: [
          {
            name: `change bucket name (current: ${chalk.bold(
              await bucketName()
            )})`,
            short: 'change bucket name',
            value: 'change_bucket_name',
          },
          { name: 'enable hosted version' },
        ],
      },
    ])

    if (responses.stage === 'change_bucket_name') {
      this.changeBucketName()
    }
  }

  async changeBucketName() {
    const { name } = await inquirer.prompt([
      { name: 'name', type: 'input', message: 'Enter bucket name' },
    ])
    if (name.length === 0) {
      console.warn('Invalid bucket name')
      return
    }
    console.log(`Bucket name set to: ${chalk.bold(name)}`)
    config.set('bucketName', name)
    install()
  }
}
