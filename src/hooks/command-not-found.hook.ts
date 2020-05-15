import { Hook } from '@oclif/config'

const hook: Hook<'command_not_found'> = async function (options) {
  // console.log('Try running rec --help')
}

export default hook
