import { expect, test } from '@oclif/test'

describe('adb env hook', () => {
  // Override path for testing
  process.env.ANDROID_HOME = ''

  test
    .stdout()
    .hook('prerun', { id: 'mycommand' })
    .do((output) => {
      expect(output.stdout).to.be.empty
      expect(process.env.ANDROID_HOME).to.be.not.empty
    })
    .it('Adds ANDROID_HOME env variable')
})

describe('Adds adb to path if ANDROID_HOME present', () => {
  // Override path for testing
  process.env.ANDROID_HOME = 'XXX/TEST/PATH/ONLY'
  // eslint-disable-next-line no-useless-escape
  const PLATFORM_TOOL_REGEX = /XXX\/TEST\/PATH\/ONLY[\/\\]platform-tools/

  test
    .stdout()
    .hook('prerun', { id: 'mycommand' })
    .do((output) => {
      expect(output.stdout).to.be.empty
      expect(process.env.PATH).to.match(PLATFORM_TOOL_REGEX)
    })
    .it('Updates the path with platform tools')
})
