import { DeviceFrame } from './../api/frame'
import * as inquirer from 'inquirer'

export const frameFromSelectorPrompt = async (frames: DeviceFrame[]) => {
  const response: { frameIndex: number } = await inquirer.prompt([
    {
      name: 'frameIndex',
      message: 'Which frame would you like to use?',
      type: 'list',
      choices: frames.map((frame, index) => ({
        name: frame.deviceName,
        value: index,
      })),
    },
  ])

  return frames[response.frameIndex]
}
