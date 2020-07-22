import * as emojiStrip from 'emoji-strip'
import * as chalk from 'chalk'

import ConfigService from './config.service'

export enum MessageStyle {
  Regular,
  Dim
}

const output = (rawText: string) => {
  const renderEmojis = Boolean(ConfigService.get('emojisDisabled'))
  const text = renderEmojis ? rawText : emojiStrip(rawText)

  console.log(text.trim())
}

export const log = (text: string, style: MessageStyle = MessageStyle.Regular) => {
  if (style === MessageStyle.Dim) {
    output(chalk.dim(text))
  } else {
    output(text)
  }
}

export const warn = (text: string) => {
  output(text)
}

export const error = (rawText: string) => {
  const text = chalk.bold(rawText)
  output(`⚠️  ${text}`)
}
