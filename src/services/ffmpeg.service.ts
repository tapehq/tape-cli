import * as util from 'util'
import { exec as originalExec } from 'child_process'
import * as path from 'path'
import * as commandExists from 'command-exists'
import * as chalk from 'chalk'

import { BIN_DIR } from './config.service'
import { DeviceOrientation } from '../helpers/orientation.helpers'

const FFMPEG = path.join(
  BIN_DIR,
  'ffmpeg -loglevel warning -nostats -hide_banner'
)
const FFMPEG_NO_FLAGS = path.join(BIN_DIR, 'ffmpeg')

export const isFfmpegAvailable = () => commandExists.sync(FFMPEG_NO_FLAGS)

// Use this "getter" to check for ffmpeg presence first
export const getFfmpegBin = () => {
  if (isFfmpegAvailable()) {
    return FFMPEG
  }

  console.log(`💥  ${chalk.bgRed('Setup not complete:')}`)
  console.log(
    `
    Run ${chalk.yellow('tape config --setup')} to download dependencies
    `
  )
  throw new Error('Ffmpeg not found.')
}

const exec = util.promisify(originalExec)

const getRotationForDeviceOrientation = (
  deviceOrientation: DeviceOrientation
) => {
  switch (deviceOrientation) {
    case DeviceOrientation.PortraitUpsideDown:
      return 'transpose=2,transpose=2'
    case DeviceOrientation.LandscapeLeft:
      return 'transpose=2'
      break
    case DeviceOrientation.LandscapeRight:
      return 'transpose=1'
  }

  return ''
}

// Output path only, will use input video name
export const makeGif = (
  inputVideoFile: string,
  outputFile: string,
  hq: boolean,
  deviceOrientation: DeviceOrientation = DeviceOrientation.Unknown
) => {
  const outputScale = hq ? 'iw' : 'iw*0.35'
  const rotation = getRotationForDeviceOrientation(deviceOrientation)
  const rotationString = rotation === '' ? '' : `${rotation},`

  return exec(
    `${getFfmpegBin()} -i ${inputVideoFile} -filter_complex 'fps=24,${rotationString}scale=${outputScale}:-1:flags=lanczos,split [o1] [o2];[o1] palettegen [p]; [o2] fifo [o3];[o3] [p] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle' ${outputFile}.gif`
  )
}

export const compressVid = (
  inputVideoFile: string,
  outputFile: string,
  deviceOrientation: DeviceOrientation = DeviceOrientation.Unknown
) => {
  const rotation = getRotationForDeviceOrientation(deviceOrientation)
  const rotationString = rotation === '' ? '' : `-vf "${rotation}"`
  return exec(
    `${getFfmpegBin()} -i ${inputVideoFile} -c:v libx264 -crf 23 -maxrate 1.5M -bufsize 1.5M ${rotationString} ${outputFile}`
  )
}

export const rotateImage = (
  inputImageFile: string,
  outputFile: string,
  deviceOrientation: DeviceOrientation = DeviceOrientation.Unknown
) => {
  const rotation = getRotationForDeviceOrientation(deviceOrientation)
  return exec(
    `${getFfmpegBin()} -y -i ${inputImageFile} -vf ${rotation} ${outputFile}`
  )
}

export default { makeGif, compressVid, rotateImage }
