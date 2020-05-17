import { install as installFfmpeg } from '../helpers/ffmpeg.helpers'
import { Command, flags } from '@oclif/command'
import * as inquirer from 'inquirer'
import * as chalk from 'chalk'

import ConfigService, { bucketName } from '../services/config.service'

export default class Config extends Command {
  static description = 'Configuration'

  static examples = ['$ rec config']

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
          {
            name: 'setup',
            short: 'full_setup',
            value: 'full_setup',
          },
          {
            name: 'Cancel',
          },
        ],
      },
    ])

    if (responses.stage === 'change_bucket_name') {
      this.changeBucketName()
    }

    if (responses.stage === 'full_setup') {
      await this.changeBucketName()
      installFfmpeg()
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
    ConfigService.set('bucketName', name)
  }
}
