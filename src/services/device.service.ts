import * as adb from 'adbkit'
import { execSync } from 'child_process'
import { filter, flatMap } from 'lodash'

import configService from './config.service'
import { chooseDevicePrompt } from '../helpers/device.helpers'
import * as chalk from 'chalk'

export interface Device {
  type: string
  id: string
  name: string
}

interface AndroidDevice {
  id: string
  type: string
  name: string
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
  const out: Promise<AndroidDevice[]> = Promise.all(
    devices.map(async (device: Device) => {
      const properties = await client.getProperties(device.id)
      const brand = properties['ro.product.board']
      const deviceName = properties['ro.product.device']
      const productName = properties['ro.product.name']
      const manufacturer = properties['ro.product.manufacturer']
      const model = properties['ro.product.model']
      const sdk = properties['ro.build.version.sdk']

      const deviceDescription = [manufacturer, model, productName, brand]

      const name = `${deviceName} (${deviceDescription.join(
        ', '
      )}) - SDK ${sdk}`
      return {
        ...device,
        name,
      }
    })
  )
  return out
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
      name: device.name,
    }
  })

  const xcode =
    (process.platform === 'darwin' &&
      getXcodeDevices().map((device: XcodeDevice) => {
        return {
          type: 'ios',
          id: device.udid,
          name: device.name,
        }
      })) ||
    []

  return [...android, ...xcode]
}

export const getActiveDevice = async (): Promise<Device | null> => {
  const bootedDevices = await getDevices()
  if (bootedDevices.length === 0) {
    console.log('Error: no devices detected.')
    return null
  }
  const activeDevice: Device = await configService.get('device')

  if (!activeDevice) {
    // console.log('no active device has been set')
    if (bootedDevices.length === 1) return bootedDevices[0]

    const device = await chooseDevicePrompt()
    console.log('Use `tape devices` to set an active device')
    return device
  }

  const isBooted = bootedDevices.find(
    (bootedDevice) => bootedDevice.id === activeDevice.id
  )
  // Their active device is booted
  if (isBooted) {
    console.log(
      `\n ℹ  Using preselected device. Use ${chalk.yellow(
        'tape devices'
      )} to choose a different device \n`
    )
    return activeDevice
  }

  // Their active device is not booted, but they're only running one device.
  if (bootedDevices.length === 1) {
    // console.log('You only have 1 device running so defaulting to that')
    return bootedDevices[0]
  }
  console.log('Your chosen device is no longer booted.')

  const device = await chooseDevicePrompt()
  console.log('Use `tape devices` to set an active device')

  return device
}

export default {
  getActiveDevice,
  getDevices,
  getAndroidDevices,
  getXcodeDevices,
}
