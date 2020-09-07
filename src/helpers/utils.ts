import { CopyFormats } from './copy.helpers'
import * as path from 'path'
import * as fs from 'fs'
import { flags } from '@oclif/command'
import * as chalk from 'chalk'
import * as prettyBytes from 'pretty-bytes'

export const isMac = () => process.platform === 'darwin'

export const copyToLocalOutput = (
  originalFile: string,
  outputPathOnly: string
) => {
  const newFilePath = path.join(outputPathOnly, path.basename(originalFile))
  fs.copyFileSync(originalFile, newFilePath)

  return newFilePath
}

export const commonFlags = {
  help: flags.help({ char: 'h' }),
  debug: flags.boolean({ char: 'd' }),
  noframe: flags.boolean({
    helpLabel: `--noframe ${chalk.grey('Disable device frames')}`,
  }),
  local: flags.string({
    char: 'l',
    helpValue: '~/Documents',
  }), // dont upload
  format: flags.string({
    options: Object.values(CopyFormats),
  }),
  selectframe: flags.boolean({
    helpLabel: `--selectframe ${chalk.grey(
      'Select which frame to use, if there are multiple'
    )}`,
    default: false,
  }),
  frame: flags.string({
    helpLabel: `--frame ${chalk.grey(
      'Select which frame to use, if there are multiple'
    )}`,
    default: '',
  }),
  nocopy: flags.boolean({
    default: false,
    helpLabel: `--nocopy ${chalk.grey('Disable copying to clipboard')}`,
  }),
}

export const bytesToSize = (bytes: number): string => prettyBytes(bytes)
