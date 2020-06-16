import { Command } from '@oclif/command'
import { forEach } from 'lodash'
import { flags } from '@oclif/command'

import { commonFlags } from './../helpers/utils'
import Video from './video'

export default class Gif extends Command {
  static description =
    'Record iOS simulators and Android devices/emulators and output a gif file'

  static examples = [
    `$ tape gif [--local $OUTPUTPATH]
🎬 Recording started. Press SPACE to save or ESC to abort.
`,
  ]

  static aliases = ['gif', 'g']

  static flags = { ...commonFlags, hq: flags.boolean({ default: false }) }

  async run() {
    const { flags } = this.parse(Gif)

    const flattenedFlags = ['--gif']

    forEach(flags, (flagValue, flagKey) => {
      if (typeof flagValue === 'boolean' && flagValue === true) {
        flattenedFlags.push(`--${flagKey}`)
      }

      if (typeof flagValue === 'string') {
        flattenedFlags.push(`--${flagKey}`)
        flattenedFlags.push(flagValue)
      }
    })

    await Video.run(flattenedFlags)
  }
}
