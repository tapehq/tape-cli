import * as util from 'util'
import { exec as originalExec } from 'child_process'
import * as path from 'path'
import * as commandExists from 'command-exists'

import { BIN_DIR } from './config.service'
import { DeviceOrientation } from '../helpers/orientation.helpers'

const FFMPEG = path.join(
  BIN_DIR,
  'ffmpeg -loglevel warning -nostats -hide_banner'
)

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
  const outputScale = hq ? 'iw' : 'iw*0.5'
  const rotation = getRotationForDeviceOrientation(deviceOrientation)
  const rotationString = rotation === '' ? '' : `${rotation},`

  return exec(
    `${FFMPEG} -i ${inputVideoFile} -filter_complex 'fps=24,${rotationString}scale=${outputScale}:-1:flags=lanczos,split [o1] [o2];[o1] palettegen [p]; [o2] fifo [o3];[o3] [p] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle' ${outputFile}.gif`
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
    `${FFMPEG} -i ${inputVideoFile} -c:v libx264 -crf 23 -maxrate 1.5M -bufsize 1.5M ${rotationString} ${outputFile}`
  )
}

export const checkIfNeeded = () => {
  return commandExists.sync(FFMPEG)
}

export default { makeGif, compressVid }
