import { createQlClient, handleError } from './client'
import cli from 'cli-ux'
import * as chalk from 'chalk'

interface DeviceFrameInputs {
  width: number
  height: number
  deviceName?: string
  type: 'gif' | 'video' | 'image'
}

export const fetchDeviceFrame = async (inputs: DeviceFrameInputs) => {
  const qlClient = await createQlClient()

  try {
    const query = `query DeviceFrames($width:Int!, $height:Int!, $type: String) {
    deviceFrames(width: $width, height:$height, type: $type){
      inputs,
      deviceName,
      filter
    }
  }`

    const data = await qlClient.request(query, inputs)

    const { deviceFrames } = data

    if (deviceFrames.length === 0) {
      cli.log(
        chalk.grey(' ☒ No frames found for resolution. Skipping framing.')
      )

      return null
    }

    cli.log(chalk.grey(` 🖼  Framing with ${deviceFrames[0].deviceName}`))

    return deviceFrames[0]
  } catch (error) {
    handleError(error)
  }
}
