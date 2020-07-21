import { exec } from 'child_process'
import * as adb from 'adbkit'
import * as util from 'util'

import { Device } from '../services/device.service'

const execPromise = util.promisify(exec)

interface IphoneSimulatorPlist {
  DevicePreferences: {
    [deviceId: string]: IphoneSimulatorPlistDevicePreference
  }
}

interface IphoneSimulatorPlistDevicePreference {
  // NOTE: 'SimulatorWindowOrientation' exists, but is not worth using for the purpose of determining
  // device orientation as it takes much longer to update compared to 'SimulatorWindowRotationAngle'.
  SimulatorWindowRotationAngle: number
}

export enum DeviceOrientation {
  Unknown,
  LandscapeRight,
  LandscapeLeft,
  PortraitUpsideDown,
  Portrait,
}

export const getXcodeDeviceOrientation = async (
  device: Device
): Promise<DeviceOrientation> => {
  const { id: deviceId } = device

  const { stdout: rawJson } = await execPromise(
    'plutil -convert json ~/Library/Preferences/com.apple.iphonesimulator.plist -o -'
  )

  const json = JSON.parse(rawJson.toString()) as IphoneSimulatorPlist

  if (deviceId in json.DevicePreferences) {
    const preferences = json.DevicePreferences[deviceId]
    switch (preferences.SimulatorWindowRotationAngle) {
      case 0:
      case -0:
        return DeviceOrientation.Portrait

      case 90:
      case -270:
        return DeviceOrientation.LandscapeLeft

      case 180:
      case -180:
        return DeviceOrientation.PortraitUpsideDown

      case 270:
      case -90:
        return DeviceOrientation.LandscapeRight

      default:
        return DeviceOrientation.Unknown
    }
  } else {
    return DeviceOrientation.Unknown
  }
}

export const getAdbDeviceOrientation = async (device: Device) => {
  const adbClient = adb.createClient()

  const output = await adbClient
    .shell(device.id, 'dumpsys display')
    .then(adb.util.readAll)
    .then((bufferOut: Buffer) => bufferOut.toString().trim())

  const ORIENTATION_REGEX = /(m[Default]*Viewport[s]*=.+)orientation=(\d+),/

  const [, , orientationCode] = output.match(ORIENTATION_REGEX)

  switch (Number(orientationCode)) {
    case 0:
      return DeviceOrientation.Portrait
    case 1:
      return DeviceOrientation.LandscapeLeft
    case 2:
      return DeviceOrientation.PortraitUpsideDown
    case 3:
      return DeviceOrientation.LandscapeRight
    default:
      return DeviceOrientation.Unknown
  }
}

export const getDeviceOrientation = async (device: Device) => {
  if (device.type === 'ios') {
    return getXcodeDeviceOrientation(device)
  }

  if (device.type === 'android') {
    return getAdbDeviceOrientation(device)
  }

  return DeviceOrientation.Unknown
}
