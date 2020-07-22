import { isEmpty } from 'lodash'
import { Hook } from '@oclif/config'

const setAdbEnvHook: Hook<'prerun'> = async function (opts) {
  console.log('Hook run!!! 🎉')

  if (isEmpty(process.env.ANDROID_HOME)) {
    const HOME = require('os').homedir()

    switch (process.platform) {
      case 'darwin':
        process.env.ANDROID_HOME = `${HOME}/Library/Android/sdk`
        break

      case 'linux':
        process.env.ANDROID_HOME = `${HOME}/Library/Android/sdk`
        break

      case 'win32':
        process.env.ANDROID_HOME = `${HOME}\\AppData\\Local\\Android\\Sdk`
        break
    }
  }

  // Add adb to path, just to make sure
  process.env.PATH = `${process.env.PATH}:${process.env.ANDROID_HOME}/platform-tools`
}

export default setAdbEnvHook
