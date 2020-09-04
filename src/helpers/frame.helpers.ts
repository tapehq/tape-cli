import * as inquirer from 'inquirer'
import * as chalk from 'chalk'

import { DeviceFrame, fetchDeviceFrame } from './../api/frame'
import { RecordingSettings } from '../services/config.service'
import { getDimensions } from '../services/ffmpeg.service'

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

export const getFrameOptions = async (outputFilePath: string, fileType: string, flags: { noframe: boolean, selectframe: boolean, frame: string }, recordingSettings?: RecordingSettings) => {
  if (flags.noframe || (recordingSettings && !recordingSettings.deviceFraming)) {
    console.log(` ℹ ${chalk.grey(' Framing disabled \n')}`)
    return null
  }

  const dimensions = await getDimensions(outputFilePath)

  const allFrames = await fetchDeviceFrame({
    ...dimensions,
    type: fileType as 'image' | 'video',
  })

  if (allFrames) {
    if (allFrames.length > 1 && flags.selectframe) {
      const frame = await frameFromSelectorPrompt(allFrames)
      return frame
    }

    if (allFrames.length > 1 && flags.frame) {
      return allFrames.find(
        (result) => result.deviceName === flags.frame
      ) || null
    }

    return allFrames[0]
  }

  return null
}