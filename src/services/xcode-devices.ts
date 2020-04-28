import { execSync } from 'child_process'
import { filter, flatMap } from 'lodash'

export const getDevices = async () => {
  const rawJson = await execSync('xcrun simctl list --json').toString()
  const json = JSON.parse(rawJson)
  return filter(flatMap(json['devices']), (device) => device.state === 'Booted')
}
