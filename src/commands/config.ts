import { Command, flags } from '@oclif/command'
import * as chalk from 'chalk'
import * as inquirer from 'inquirer'
import { isEmpty, mapValues } from 'lodash'
import * as open from 'open'
import * as os from 'os'

import ConfigService, { FILE as CONFIG_FILE } from '../services/config.service'
import {
  getRecordingSettingsChoices,
  getShareChoices,
  mainConfigChoices,
} from './../helpers/config.menus'
import { logoAscii } from './../helpers/logo.ascii'
import {
  checkDependencies,
  hasAccessToken,
  TAPE_HOST,
} from './../services/config.service'

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

    const responses = await inquirer.prompt(mainConfigChoices)

    switch (responses.choice) {
      case 'full_setup':
        await this.fullSetup()
        break

      case 'login':
        await this.login()
        break

      case 'upload_settings':
        await this.uploadSettings()
        break

      case 'settings':
        await this.settings()
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

  async uploadSettings() {
    const currentBucketName = await ConfigService.get('bucketName')

    const responses = await inquirer.prompt(getShareChoices(currentBucketName))

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

  async settings() {
    const recordingSettings = await ConfigService.getRecordingSettings()

    const tableResult = await inquirer.prompt(
      getRecordingSettingsChoices(recordingSettings)
    )

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore-next-line
    const newSettings = mapValues(tableResult, (val) => val[0])

    this.log(' 🆒 Saved settings. Happy Taping!')

    await ConfigService.set('recordingSettings', newSettings)
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
