import { isEmpty } from 'lodash'
import * as util from 'util'
import { exec as originalExec } from 'child_process'
import * as commandExists from 'command-exists'
import * as chalk from 'chalk'
import * as os from 'os'
import * as pathToFfmpeg from 'ffmpeg-static'
import * as ffprobe from 'ffprobe-static'

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

const decodeFrameOptions = (
  frameOptions: FrameOptions | null,
  transposeString?: string | null
) => {
  let extraInputs = ''
  let complexFilter = ''

  if (frameOptions) {
    extraInputs = frameOptions.inputs
      .map((frameInput) => `-i ${frameInput}`)
      .join(' ')
    complexFilter = `-filter_complex "${frameOptions.filter}"`

    if (!isEmpty(transposeString)) {
      complexFilter += `[framed],[framed]${transposeString}`
    }
  }

  return {
    extraInputs,
    complexFilter,
  }
}

// Output path only, will use input video name
export const makeGif = async (
  inputVideoFile: string,
  outputFile: string,
  hq: boolean,
  deviceOrientation: DeviceOrientation = DeviceOrientation.Unknown,
  frameOptions: FrameOptions | null
) => {
  const rotation = getRotationForDeviceOrientation(deviceOrientation)
  const rotationString = rotation === '' ? '' : `${rotation},`

  const palette = `${os.tmpdir()}/palette.png`

  // @TODO allow user to pass in more granular options?
  const fps = hq ? 20 : 10
  const outputScale = hq ? 'iw*0.7' : 'iw*0.35'
  const dither = hq ? 'bayer:bayer_scale=5:diff_mode=rectangle' : 'none'
  const maxColors = hq ? 256 : 192

  const gifFilters = `fps=${fps},${rotationString}scale=${outputScale}:-1:flags=lanczos`

  if (frameOptions) {
    const intermediary = `${os.tmpdir()}/intermediary.mov`
    const { extraInputs, complexFilter } = decodeFrameOptions(frameOptions)
    await exec(
      `
      ${getFfmpegBin()} -i ${inputVideoFile} ${extraInputs} -vcodec prores_ks -pix_fmt yuva444p10le -profile:v 4444 -q:v 23 -preset fastest ${complexFilter} -y ${intermediary} &&
      ${getFfmpegBin()} -i ${intermediary} -vf "${gifFilters},palettegen=stats_mode=diff:max_colors=${maxColors}" -y ${palette} &&
      ${getFfmpegBin()} -i ${intermediary} -i ${palette} -lavfi "${gifFilters},paletteuse=dither=${dither}" -y ${outputFile}.gif
      `
    )
  } else {
    await exec(
      `
      ${getFfmpegBin()} -i ${inputVideoFile} -vf "${gifFilters},palettegen=stats_mode=diff:max_colors=${maxColors}" -y ${palette} &&
      ${getFfmpegBin()} -i ${inputVideoFile} -i ${palette} -lavfi "${gifFilters},paletteuse=dither=${dither}" -y ${outputFile}.gif
      `
    )
  }

  return `${outputFile}.gif`
}

interface FrameOptions {
  inputs: string[]
  filter: string
}

export const processVideo = async (
  inputVideoFile: string,
  outputFile: string,
  deviceOrientation: DeviceOrientation = DeviceOrientation.Unknown,
  frameOptions: FrameOptions | null
) => {
  const rotation = getRotationForDeviceOrientation(deviceOrientation)

  // Let complex filter rotate for frames
  const rotationFilter =
    rotation === '' || frameOptions ? '' : `-vf "${rotation}"`

  const { extraInputs, complexFilter } = decodeFrameOptions(
    frameOptions,
    rotation
  )

  await exec(
    `${getFfmpegBin()} -i ${inputVideoFile} ${extraInputs} -preset faster -c:v libx264 -movflags +faststart -crf 23 -maxrate 1.5M -bufsize 1.5M ${complexFilter} ${rotationFilter} ${outputFile}.mp4`
  )

  return `${outputFile}.mp4`
}

export const processImage = async (
  inputImageFile: string,
  outputFile: string,
  deviceOrientation: DeviceOrientation = DeviceOrientation.Unknown,
  frameOptions: FrameOptions | null
) => {
  const rotation = getRotationForDeviceOrientation(deviceOrientation)

  const { extraInputs, complexFilter } = decodeFrameOptions(
    frameOptions,
    rotation
  )

  // Let complex filter rotate for frames
  const rotationFilter =
    rotation === '' || frameOptions ? '' : `-vf "${rotation}"`

  await exec(
    `${getFfmpegBin()} -y -i ${inputImageFile} ${extraInputs} ${rotationFilter} ${complexFilter} ${outputFile}.png`
  )

  return `${outputFile}.png`
}

export const getDimensions = async (
  inputPathToFile: string
): Promise<{ width: number; height: number }> => {
  const { stdout } = await exec(
    `${ffprobe.path} -v error -show_entries stream=width,height -of json ${inputPathToFile}`
  )

  const { streams } = JSON.parse(stdout)

  return {
    ...streams[0],
  }
}

export default { makeGif, processVideo, processImage }
