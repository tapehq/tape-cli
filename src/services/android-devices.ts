import * as adb from 'adbkit'

export const getDevices = async () => {
  const client = adb.createClient()
  const devices = await client.listDevices()
  return devices
}
