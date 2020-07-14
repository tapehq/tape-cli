import { expect, test } from '@oclif/test'

describe('Screenshot', () => {
  test
    .stdout()
    .command('screenshot')
    .it('doesnt find any devices', (ctx) => {
      expect(ctx.stdout).to.contain('no devices detected')
    })
})
