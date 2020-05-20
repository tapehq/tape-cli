import { expect, test } from '@oclif/test'

describe('Help', () => {
  test
    .stdout()
    .command(['help'])
    .it('runs tape', (ctx) => {
      expect(ctx.stdout).to.contain('COMMANDS')
    })
})
