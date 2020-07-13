import * as adb from 'adbkit'
import { execSync } from 'child_process'
import { filter, flatMap } from 'lodash'

import configService, { adbAvailable } from './config.service'
import { chooseDevicePrompt } from '../helpers/device.helpers'
import * as chalk from 'chalk'

export interface Device {
  type: string
  id: string
  name: string
  subtype?: string
  isEmulator?: boolean
}

interface AndroidDevice {
  id: string
  type: string
  name: string
  isEmulator: boolean
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
  if (!adbAvailable()) return []

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

      const kernelQemu = properties['ro.kernel.qemu']

      const deviceDescription = [manufacturer, model, productName, brand]

      const isEmulator = kernelQemu === '1' && deviceName.includes('generic_x')

      const name = `${deviceName} (${deviceDescription.join(
        ', '
      )}) - SDK ${sdk}`
      return {
        ...device,
        isEmulator,
        name,
      }
    })
  )
  return out
}

export const getXcodeDevices = (): XcodeDevice[] => {
  try {
    const result = execSync('xcrun simctl list --json', {
      stdio: ['inherit', 'pipe', 'pipe'],
    })

    const rawJson = result.toString()
    const json = JSON.parse(rawJson)
    const devices: XcodeDevice[] = json.devices
    return filter(
      flatMap(devices),
      (device: XcodeDevice) => device.state === 'Booted'
    )
  } catch (error) {
    console.log(chalk.bold('⚠️  Warning: failed to fetch Xcode devices'))
    if (error.message.includes('unable to find utility "simctl"')) {
      console.log('Xcode detected, but looks like you need to set your version of Xcode Command Line Tools')
      console.log('Please open Xcode -> Preferences -> Locations -> select Command Line Tools')
    } else {
      console.log(chalk.dim(error.toString()))
    }
    return []
  }
}

export const getDevices = async (): Promise<Device[]> => {
  const androidDevices = await getAndroidDevices()
  const android = androidDevices.map((device: AndroidDevice) => {
    return {
      type: 'android',
      id: device.id,
      name: device.name,
      isEmulator: device.isEmulator,
    }
  })

  const xcode =
    (process.platform === 'darwin' &&
      getXcodeDevices().map((device: XcodeDevice) => {
        return {
          type: 'ios',
          id: device.udid,
          name: device.name,
          subtype: device.deviceTypeIdentifier,
          isEmulator: true,
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
