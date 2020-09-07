import { CopyFormats } from './copy.helpers'
import { RecordingSettings } from './../services/config.service'
import * as inquirer from 'inquirer'
import * as chalk from 'chalk'

export const mainConfigChoices = [
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
        name: 'Settings',
        value: 'settings',
      },
      {
        name: 'Upload settings',
        value: 'upload_settings',
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
]

export const getShareChoices = (currentBucketName: string) => {
  return [
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
  ]
}

export const getRecordingSettingsChoices = (
  existingSettings: RecordingSettings
) => {
  inquirer.registerPrompt('table', require('inquirer-table-prompt'))

  return [
    {
      type: 'table',
      name: 'deviceFraming',
      message: 'Device framing',
      columns: [
        {
          name: 'Enabled',
          value: true,
        },
        {
          name: 'Disabled',
          value: false,
        },
      ],
      rows: [
        {
          name: 'Device Framing',
          default: existingSettings.deviceFraming,
        },
      ],
    },
    {
      type: 'table',
      name: 'copyFormat',
      message: 'Copy format',
      columns: Object.values(CopyFormats),
      rows: [
        {
          name: 'Copy Link as',
          default: existingSettings.copyFormat,
        },
      ],
    },
  ]
}
