import * as adb from 'adbkit'
import { execSync } from 'child_process'
import { filter, flatMap } from 'lodash'
import configService from './config.service'
import { chooseDevicePrompt } from '../helpers/device.helpers'

export interface Device {
  type: string
  id: string
  name: string
}

interface AndroidDevice {
  id: string
  type: string
}

interface XcodeDevice {
  dataPath: string
  logPath: string
  udid: string
  isAvailable: boolean
  deviceTypeIdentifier: string
  state: string
  name: string
}

export const getAndroidDevices = async (): Promise<AndroidDevice[]> => {
  const client = adb.createClient()
  const devices = await client.listDevices()
  return devices
  // console.log(await client.listDevicesWithPaths())
  // console.log(await client.getFeatures(devices[0].id))

  // const raw = execSync('adb devices -l').toString()
  // console.log(JSON.stringify(raw))
}

export const getXcodeDevices = (): XcodeDevice[] => {
  const rawJson = execSync('xcrun simctl list --json').toString()
  const json = JSON.parse(rawJson)
  const devices: XcodeDevice[] = json.devices
  return filter(
    flatMap(devices),
    (device: XcodeDevice) => device.state === 'Booted'
  )
}

export const getDevices = async (): Promise<Device[]> => {
  const androidDevices = await getAndroidDevices()
  const android = androidDevices.map((device: AndroidDevice) => {
    return {
      type: 'android',
      id: device.id,
      name: device.type, // TODO: get device name/model properly and change me
    }
  })

  const xcode = getXcodeDevices().map((device: XcodeDevice) => {
    return {
      type: 'ios',
      id: device.udid,
      name: device.name,
    }
  })

  return [...android, ...xcode]
}

export const getActiveDevice = async (): Promise<Device | null> => {
  const bootedDevices = await getDevices()
  if (bootedDevices.length === 0) {
    console.log('Error: no devices detected.')
    return null
  }
  const activeDevice = await configService.get('device')
  // console.log({ activeDevice })
  if (activeDevice) {
    // console.log(JSON.stringify(activeDevice))
    const isBooted = bootedDevices.find(
      (bootedDevice) => bootedDevice.id === activeDevice.id
    )
    if (isBooted) {
      // Their active device is booted
      return activeDevice
    } else {
      // Their active device is not booted
      console.log('Your chosen device is no longer booted.')
      const device = await chooseDevicePrompt()
      console.log('Use `rec devices` to set an active device')

      return device
    }
  } else {
    // console.log('no active device has been set')

    if (bootedDevices.length === 1) {
      // console.log('You only have 1 device running so defaulting to that')
      return bootedDevices[0]
    }
    const device = await chooseDevicePrompt()
    console.log('Use `rec devices` to set an active device')
    return device
  }
}
