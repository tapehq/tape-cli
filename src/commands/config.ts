import { Command, flags } from '@oclif/command'
import * as inquirer from 'inquirer'
import { isEmpty } from 'lodash'
import * as chalk from 'chalk'
import * as open from 'open'
import * as os from 'os'

import { logoAscii } from './../helpers/logo.ascii'
import {
  checkDependencies,
  hasAccessToken,
  TAPE_HOST,
  DISABLED_RECORDING_SETTINGS,
} from './../services/config.service'
import ConfigService, { FILE as CONFIG_FILE } from '../services/config.service'

export default class Config extends Command {
  static description = 'Configuration'

  static examples = ['$ tape config']

  static flags = {
    help: flags.help({ char: 'h' }),
    setup: flags.boolean({ char: 's' }),
    check: flags.boolean(),
    login: flags.boolean(),
  }

  static args = [{ name: 'name', required: false }]

  async run() {
    const { flags } = this.parse(Config)

    this.log(logoAscii)

    if (flags.setup) {
      await this.fullSetup()
      return
    }

    if (flags.login) {
      await this.login()
      return
    }

    if (flags.check) {
      await this.checkSetup()
      return
    }

    const responses = await inquirer.prompt([
      {
        name: 'choice',
        message: 'What would you like to configure?',
        type: 'list',
        loop: false,
        choices: [
          {
            name: 'Login to Tape.sh',
            value: 'login',
          },
          {
            name: 'Run full Setup',
            short: 'Setup 📼 Tape',
            value: 'full_setup',
          },
          new inquirer.Separator(),
          {
            name: 'Upload/Share settings',
            value: 'share_settings',
          },
          {
            name: 'Recording settings',
            value: 'recording_settings',
          },
          new inquirer.Separator(),
          {
            name: 'Open Config File',
            short: 'Open Config File',
            value: 'open_config',
          },
          {
            name: 'Logout',
            value: 'logout',
          },
          new inquirer.Separator(),
          {
            name: 'Cancel',
          },
          new inquirer.Separator(),
        ],
      },
    ])

    switch (responses.choice) {
      case 'full_setup':
        await this.fullSetup()
        break

      case 'login':
        await this.login()
        break

      case 'share_settings':
        await this.shareSettings()
        break

      case 'recording_settings':
        await this.recordingSettings()
        break

      case 'open_config':
        await this.openConfigFile()
        break

      case 'logout':
        await this.logout()
        break

      default:
      // do nothing
    }
  }

  async useTape() {
    await ConfigService.set('bucketName', null)

    const isLoggedIn = await hasAccessToken()

    if (!isLoggedIn) {
      await this.login()
    }

    this.log(
      `\n 🍰 Will use Tape.sh for your uploads. \n Your dashboard -> ${chalk.yellow(
        'https://dashboard.tape.sh'
      )}`
    )
  }

  async shareSettings() {
    const currentBucketName = await ConfigService.get('bucketName')

    const responses = await inquirer.prompt([
      {
        name: 'choice',
        message: 'Upload/Share settings',
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
        ],
      },
    ])

    switch (responses.choice) {
      case 'change_bucket_name':
        await this.changeBucketName()
        break

      case 'use_tape':
        await this.useTape()
        break

      default:
      // do nothing
    }
  }

  // Try to only use booleans here
  async recordingSettings() {
    // Framing enabled by default
    const recordingSettings = await ConfigService.get('recordingSettings')

    const checkedSettings: {
      recordingSettings: string[]
    } = await inquirer.prompt([
      {
        name: 'recordingSettings',
        message: 'Toggle recording settings',
        type: 'checkbox',
        choices: [
          {
            name: `Device framing ${chalk.grey(
              '- wraps a neat frame around your tapes'
            )}`,
            value: 'enableFraming',
            checked: !recordingSettings?.disableFraming,
          },
        ],
      },
    ])

    const newRecordingSettings: Record<string, string | boolean> = {
      ...DISABLED_RECORDING_SETTINGS,
    }

    // Because inquirer only returns enabled choices
    checkedSettings.recordingSettings.forEach((settingName) => {
      if (settingName === 'enableFraming') {
        newRecordingSettings.disableFraming = !(settingName === 'enableFraming')
      } else {
        newRecordingSettings[settingName] = true
      }
    })

    await ConfigService.set('recordingSettings', newRecordingSettings)
  }

  async logout() {
    await ConfigService.set('token', null)

    this.log(`${chalk.blue('Logged out. See you later! ✌🏾')}`)
  }

  async login() {
    const label = os.hostname()
    await open(`${TAPE_HOST}/cli-tokens/new?label=${label}`)

    const oldToken = await ConfigService.get('token')

    const currentTokenText = oldToken
      ? ` (current: ${chalk.yellow(oldToken)})`
      : ''
    const { cliToken } = await inquirer.prompt([
      {
        name: 'cliToken',
        type: 'input',
        message: `Paste the token from the browser${currentTokenText}: `,
      },
    ])

    await ConfigService.set('token', cliToken || oldToken)

    this.log("\n 🎉  You're good to go! Some examples:")
    this.log(
      `
      ${chalk.green('tape image')}
      ${chalk.yellow('tape video')}
      ${chalk.blue('tape gif --format md')}`
    )
  }

  async checkSetup() {
    await checkDependencies()
  }

  async openConfigFile() {
    open(CONFIG_FILE)

    this.log(`   ${chalk.grey(`Opening config file at: ${CONFIG_FILE}`)}`)
  }

  async fullSetup() {
    await checkDependencies()
    await this.login()
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
