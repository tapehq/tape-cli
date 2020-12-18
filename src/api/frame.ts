import { createQlClient, handleError } from './client'
import cli from 'cli-ux'
import * as chalk from 'chalk'

interface DeviceFrameInputs {
  width: number
  height: number
  deviceName?: string
  type: 'gif' | 'video' | 'image'
}

export interface DeviceFrame {
  inputs: string[]
  deviceName: string
  filter: string
}

export const fetchDeviceFrame = async (
  inputs: DeviceFrameInputs
): Promise<DeviceFrame[] | null> => {
  const qlClient = await createQlClient()

  try {
    const query = `query DeviceFrames($width:Int!, $height:Int!, $type: String, $deviceName: String) {
    deviceFrames(width: $width, height:$height, type: $type, deviceName: $deviceName){
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

      return []
    }

    return deviceFrames
  } catch (error) {
    handleError(error)
    return []
  }
}
