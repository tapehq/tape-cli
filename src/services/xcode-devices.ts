import { execSync } from 'child_process'
import { filter, flatMap } from 'lodash'

interface Device {
  dataPath: string
  logPath: string
  udid: string
  isAvailable: boolean
  deviceTypeIdentifier: string
  state: string
  name: string
}

export const getDevices = () => {
  const rawJson = execSync('xcrun simctl list --json').toString()
  const json = JSON.parse(rawJson)
  return filter(
    flatMap(json.devices),
    (device: Device) => device.state === 'Booted'
  )
}
