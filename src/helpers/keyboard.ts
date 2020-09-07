import cli from 'cli-ux'
const readline = require('readline')

// TODO these should be arrays..maybeh?
export const waitForKeys = (
  successfulKey: string,
  failureKey: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    readline.emitKeypressEvents(rl.input)

    if (process.stdin.isTTY) {
      rl.input.setRawMode(true)
      cli.action.start(
        ' 🎬 Recording started. Press SPACE to save or ESC to abort.'
      )
    } else {
      cli.action.start(
        ' 🎬 Recording started. Press Ctrl + C to save.'
      )
      process.on('SIGINT', function() { resolve(true) })
    }

    process.stdin.on('keypress', (str, key) => {
      // console.log({ str, key })
      if (key.name === successfulKey || key.name === failureKey) {
        rl.close()
        if (key.name === successfulKey) {
          resolve(true)
        } else {
          resolve(false)
        }
      }
    })
  })
}
