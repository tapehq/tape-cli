import * as emojiStrip from 'emoji-strip'
import * as chalk from 'chalk'
import cli from 'cli-ux'

import ConfigService from './config.service'

export enum MessageStyle {
  Regular,
  Dim
}

const output = (rawText: string, style: MessageStyle = MessageStyle.Regular) => {
  const emojisDisabled = ConfigService.get('emojisDisabled') || false
  let text = emojisDisabled ? emojiStrip(rawText) : rawText

  if (style === MessageStyle.Dim) {
    text = chalk.dim(text)
  }

  cli.log(text.trim())
}

export const log = output
export const debug = output

export const warn = (rawText: string, style: MessageStyle = MessageStyle.Regular) => {
  const text = chalk.yellow(chalk.bold(rawText))
  output(`⚠️ WARNING: ${text}`, style)
}

export const error = (rawText: string, style: MessageStyle = MessageStyle.Regular) => {
  const text = chalk.red(chalk.bold(rawText))
  output(`⚠️ ERROR: ${text}`, style)
}
