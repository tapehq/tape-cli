// src/error-handling-command.ts
import * as os from 'os'
import * as chalk from 'chalk'

import Command from '@oclif/command'
import { handle as oclifErrorHandler } from '@oclif/errors'
import githubIssueUrl from 'new-github-issue-url'

export default abstract class extends Command {
  details = () => {
    let detailsString = ''

    const info = {
      os: os.platform(),
      arch: os.arch(),
    }

    Object.entries(info).forEach(([key, value]) => {
      detailsString += `- **${key}**: ${value} \n`
    })

    return detailsString
  }

  async catch(error: Error) {
    oclifErrorHandler(error)

    const url = githubIssueUrl({
      user: 'edamameldn',
      repo: 'tape-cli',
      body: `\n\n\n Error:\n \`\`\`\n<PASTE_OUTPUT_HERE>\n\`\`\` \n\n\n---\n ${this.details()}`,
    })

    // do whatever you need to
    this.log('\n')
    this.log(
      `${chalk.green('If you use Tape.sh:')} ${chalk.dim(
        'https://help.tape.sh/articles/help/'
      )}`
    )
    this.log(
      `${chalk.blue('Or raise a Github issue:')} ${chalk.dim(` ${url}`)} \n \n`
    )

    // return the error to oclifHandler
    this.exit()
  }
}
