import * as util from 'util'
import { exec as originalExec } from 'child_process'
import * as commandExists from 'command-exists'
import * as chalk from 'chalk'
import * as os from 'os'
import * as pathToFfmpeg from 'ffmpeg-static'

import { DeviceOrientation } from '../helpers/orientation.helpers'

const FFMPEG = `${pathToFfmpeg} -loglevel warning -nostats -hide_banner`
const FFMPEG_NO_FLAGS = pathToFfmpeg

export const isFfmpegAvailable = () => commandExists.sync(FFMPEG_NO_FLAGS)

// Use this "getter" to check for ffmpeg presence first
export const getFfmpegBin = () => {
  if (isFfmpegAvailable()) {
    return FFMPEG
  }

  console.log(`💥  ${chalk.bgRed('Uh oh! Ffmpeg is not available.')}`)
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
  const rotation = getRotationForDeviceOrientation(deviceOrientation)
  const rotationString = rotation === '' ? '' : `${rotation},`

  const palette = `${os.tmpdir()}/palette.png`

  // @TODO allow user to pass in more granular options?
  const fps = hq ? 20 : 10
  const outputScale = hq ? 'iw*0.7' : 'iw*0.35'
  const dither = hq ? 'bayer:bayer_scale=5:diff_mode=rectangle' : 'none'
  const maxColors = hq ? 256 : 192

  const filters = `fps=${fps},${rotationString}scale=${outputScale}:-1:flags=lanczos`

  return exec(
    `${getFfmpegBin()} -i ${inputVideoFile} -vf "${filters},palettegen=stats_mode=diff:max_colors=${maxColors}" -y ${palette} &&
    ${getFfmpegBin()} -i ${inputVideoFile} -i ${palette} -lavfi "${filters},paletteuse=dither=${dither}" -y ${outputFile}.gif`
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
