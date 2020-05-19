import { install as installFfmpeg } from '../helpers/ffmpeg.helpers'
import { Command, flags } from '@oclif/command'
import * as inquirer from 'inquirer'
import * as chalk from 'chalk'

import ConfigService from '../services/config.service'

export default class Config extends Command {
  static description = 'Configuration'

  static examples = ['$ tape config']

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'name', required: false }]

  async run() {
    this.parse(Config)

    const currentBucketName = await ConfigService.get('bucketName')

    const responses = await inquirer.prompt([
      {
        name: 'stage',
        message: 'config',
        type: 'list',
        choices: [
          {
            name: `change bucket name (current: ${chalk.yellow(
              currentBucketName
            )})`,
            short: 'change bucket name',
            value: 'change_bucket_name',
          },
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
    const oldName = await ConfigService.get('bucketName')

    const { name } = await inquirer.prompt([
      {
        name: 'name',
        type: 'input',
        message: `Enter bucket name  (current: ${chalk.yellow(oldName)})`,
      },
    ])

    if (name.length === 0) {
      console.log(
        `No input, using previous bucket name ${chalk.bold(oldName)}..`
      )
    }

    if (name.length === 0 && oldName.length === 0) {
      console.warn('Please set a bucket name.')
    }

    const newName = name || oldName

    console.log(`Bucket name set to: ${chalk.green(newName)}`)
    ConfigService.set('bucketName', newName)
  }
}
