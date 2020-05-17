import { Device, getDevices } from '../services/device.service'
import * as inquirer from 'inquirer'
import * as chalk from 'chalk'

export const deviceToFriendlyString = (device: Device) => {
  const type = chalk.bold(`[${device.type}]`)
  const name = chalk.white(device.name)
  const id = chalk.grey(`(${device.id})`)

  return `${type} ${name} ${id}`
}

export const chooseDevicePrompt = async () => {
  const devices = await getDevices()

  const choices = devices.map((device: Device) => {
    return {
      name: deviceToFriendlyString(device),
      value: device,
    }
  })

  const { device } = await inquirer.prompt([
    {
      name: 'device',
      message: 'Select a device',
      type: 'list',
      choices,
    },
  ])

  return device
}
