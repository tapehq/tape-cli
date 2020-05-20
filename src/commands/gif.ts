import { Command } from '@oclif/command'
import { forEach } from 'lodash'

import { commonFlags } from './../helpers/utils'
import Video from './video'

export default class Gif extends Command {
  static description = 'Record iOS/Android devices/simulators'

  static examples = [
    `$ tape gif [--local $OUTPUTPATH]
🎬 Recording started. Press SPACE to save or ESC to abort.
`,
  ]

  static aliases = ['gif', 'g']

  static flags = commonFlags

  async run() {
    const { flags } = this.parse(Gif)

    const flattenedFlags: string[] = ['--gif']

    forEach(flags, (flagValue, flagKey) => {
      if (flagValue === true) {
        flattenedFlags.push(`--${flagKey}`)
      } else {
        flattenedFlags.push(`--${flagKey}`)
        flattenedFlags.push(`${flagValue}`)
      }
    })

    await Video.run(flattenedFlags)
  }
}
