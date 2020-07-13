import { Hook } from '@oclif/config'
import * as chalk from 'chalk'

import {
  hasAccessToken,
  isUsingCustomBucket,
} from './../../services/config.service'

const hook: Hook<'init'> = async function (opts) {
  const ignoredCommands = {
    login: true,
    config: true,
    devices: true,
    help: true,
    version: true,
  }

  if (opts.id && !(opts.id in ignoredCommands)) {
    const isLoggedIn = await hasAccessToken()
    const hasCustomBucket = await isUsingCustomBucket()

    if (!isLoggedIn && !hasCustomBucket) {
      this.error(`👩🏽‍💻 Please login first -> ${chalk.yellow('tape login')}`)
    }
  }
}

export default hook
