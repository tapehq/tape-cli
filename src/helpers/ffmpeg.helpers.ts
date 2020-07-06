import { BIN_DIR } from '../services/config.service'

const { get } = require('https')
const { cursorTo } = require('readline')
const decompress = require('decompress')
const tarxz = require('decompress-tarxz')
const unzip = require('decompress-unzip')

// Adapted from
// https://github.com/Hackzzila/node-ffmpeg-binaries/blob/master/install.js
// Needs updating so syntax is more readable with promises, etc.

function callback(res: any, onDone: () => void, onFailure: () => void) {
  let last: any
  let complete = 0
  const total = parseInt(res.headers['content-length'], 10)

  let index = 0
  const buf = Buffer.alloc(total)

  res.on('data', (chunk: any) => {
    chunk.copy(buf, index)
    index += chunk.length

    complete += chunk.length
    const progress = Math.round((complete / total) * 20)

    if (progress !== last) {
      cursorTo(process.stdout, 0, null)

      process.stdout.write(
        `Downloading dependencies: [${'='.repeat(progress)}${[
          ' '.repeat(20 - progress),
        ]}] ${Math.round((complete / total) * 100)}%`
      )

      last = progress
    }
  })

  res.on('end', () => {
    cursorTo(process.stdout, 0, null)
    console.log(`Downloading dependencies: [${'='.repeat(20)}] 100%`)

    decompress(buf, BIN_DIR, {
      plugins: process.platform === 'linux' ? [tarxz()] : [unzip()],
      strip: process.platform === 'linux' ? 1 : 2,
      filter: (x: any) =>
        x.path === (process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
      // output: CONFIG_DIR,
    })
      .then(() => {
        console.log("You're good to go! 🎉")
        console.log('Some examples: tape image | tape video | tape video --gif')
        onDone()
      })
      .catch(() => {
        onFailure()
      })
  })
}

export const install = async () => {
  console.log(`ℹ️  Detected ${process.platform} ${process.arch}`)

  // ------- Promise workaround -------
  let onDone: { (value?: unknown): void; (): void }
  let onFailure: { (reason?: any): void; (): void }

  const result = new Promise((resolve, reject) => {
    onDone = resolve
    onFailure = reject
  })

  const downloadCallback = (res: any) => {
    callback(res, onDone, onFailure)
  }
  // ==============================

  if (process.platform === 'win32') {
    switch (process.arch) {
      case 'x64':
        get(
          'https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-latest-win64-static.zip',
          downloadCallback
        )
        break
      case 'ia32':
        get(
          'https://ffmpeg.zeranoe.com/builds/win32/static/ffmpeg-latest-win32-static.zip',
          downloadCallback
        )
        break
      default:
        throw new Error('unsupported platform')
    }
  } else if (process.platform === 'linux') {
    switch (process.arch) {
      case 'x64':
        get(
          'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz',
          downloadCallback
        )
        break
      case 'ia32':
        get(
          'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-i686-static.tar.xz',
          downloadCallback
        )
        break
      case 'arm':
        get(
          'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-armhf-32bit-static.tar.xz',
          downloadCallback
        )
        break
      case 'arm64':
        get(
          'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-arm64-64bit-static.tar.xz',
          downloadCallback
        )
        break
      default:
        throw new Error('unsupported platform')
    }
  } else if (process.platform === 'darwin') {
    switch (process.arch) {
      case 'x64':
        get(
          'https://ffmpeg.zeranoe.com/builds/macos64/static/ffmpeg-latest-macos64-static.zip',
          downloadCallback
        )
        break
      default:
        throw new Error('unsupported platform')
    }
  } else {
    throw new Error('unsupported platform')
  }

  return result
}
