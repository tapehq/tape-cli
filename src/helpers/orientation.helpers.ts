import { execSync } from 'child_process'

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

export const getXcodeDeviceOrientation = (
  deviceId: string
): DeviceOrientation => {
  const rawJson = execSync(
    'plutil -convert json ~/Library/Preferences/com.apple.iphonesimulator.plist -o -'
  ).toString()
  const json = JSON.parse(rawJson) as IphoneSimulatorPlist

  if (deviceId in json.DevicePreferences) {
    const preferences = json.DevicePreferences[deviceId]

    switch (preferences.SimulatorWindowRotationAngle) {
      case 0:
      case -0:
        return DeviceOrientation.Portrait

      case 90:
      case -90:
        return DeviceOrientation.LandscapeRight

      case 180:
      case -180:
        return DeviceOrientation.PortraitUpsideDown

      case 270:
      case -270:
        return DeviceOrientation.LandscapeLeft

      default:
        return DeviceOrientation.Unknown
    }
  } else {
    return DeviceOrientation.Unknown
  }
}
