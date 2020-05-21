import { logoAscii } from './../helpers/logo.ascii'
import { checkIfNeeded } from './../services/ffmpeg.service'
import { checkDependencies } from './../services/config.service'
import { install as installFfmpeg } from '../helpers/ffmpeg.helpers'
import { Command, flags } from '@oclif/command'
import * as inquirer from 'inquirer'
import * as chalk from 'chalk'

import ConfigService from '../services/config.service'
import { isEmpty } from 'lodash'

export default class Config extends Command {
  static description = 'Configuration'

  static examples = ['$ tape config']

  static flags = {
    help: flags.help({ char: 'h' }),
    setup: flags.boolean({ char: 's' }),
  }

  static args = [{ name: 'name', required: false }]

  async run() {
    const { flags } = this.parse(Config)

    console.log(logoAscii)

    if (flags.setup) {
      await this.fullSetup()
      return
    }

    const currentBucketName = await ConfigService.get('bucketName')

    const responses = await inquirer.prompt([
      {
        name: 'choice',
        message: 'What would you like to configure?',
        type: 'list',
        choices: [
          {
            name: 'Use Tape.sh for uploads',
            value: 'use_tape',
          },
          {
            name: `Set bucket name (current: ${chalk.yellow(
              currentBucketName || 'Tape.sh hosted'
            )})`,
            short: 'Set bucket name',
            value: 'change_bucket_name',
          },
          {
            name: 'Setup',
            short: 'Setup 📼 Tape',
            value: 'full_setup',
          },
          {
            name: 'Cancel',
          },
        ],
      },
    ])

    if (responses.choice === 'change_bucket_name') {
      this.changeBucketName()
    }

    if (responses.choice === 'use_tape') {
      this.useTape()
    }

    if (responses.choice === 'full_setup') {
      await this.fullSetup()
    }
  }

  useTape() {
    ConfigService.set('bucketName', null)
    this.log(
      `\n 🍰 Will use Tape.sh for your uploads. \n Your dashboard -> ${chalk.yellow(
        'https://dashboard.tape.sh'
      )}`
    )
  }

  async fullSetup() {
    await checkDependencies()
    // await this.changeBucketName()
    if (checkIfNeeded()) {
      const { choice: redownload } = await inquirer.prompt([
        {
          name: 'choice',
          message: 'Reinstall dependencies?',
          type: 'list',
          choices: [
            {
              name: 'Nope.',
              value: false,
            },
            {
              name: 'Yes please!',
              value: true,
            },
          ],
        },
      ])

      if (redownload) {
        installFfmpeg()
      } else {
        this.log("You're good to go! 🎉")
        this.log('Some examples: tape image | tape video | tape video --gif')
      }
    } else {
      installFfmpeg()
    }
  }

  async changeBucketName() {
    const oldName = await ConfigService.get('bucketName')

    this.log(' 🎩 BYOB eh? (Bring your own bucket)')

    const { name } = await inquirer.prompt([
      {
        name: 'name',
        type: 'input',
        message: `Enter bucket name  (current: ${chalk.yellow(oldName)})`,
      },
    ])

    const newName = name || oldName

    if (name.length === 0) {
      if (isEmpty(oldName)) {
        this.log(` ${chalk.cyan('Custom bucket not set')}`)
        this.useTape()
      } else {
        this.log(
          ` No input, using previous bucket name ${chalk.bold(oldName)}..`
        )
      }
    } else {
      this.log(`Bucket name set to: ${chalk.green(newName)}`)
    }

    ConfigService.set('bucketName', newName)
  }
}
