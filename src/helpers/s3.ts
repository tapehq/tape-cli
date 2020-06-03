import * as AWS from 'aws-sdk'
import * as fs from 'fs'
import * as mime from 'mime-types'
import * as path from 'path'
import * as chalk from 'chalk'
import cli from 'cli-ux'

import ConfigService from '../services/config.service'
import { generateSignedUploadURL, putFile } from '../api/upload'
import { formatLink, CopyFormats } from './copy.helpers'

const uploadFileToTape = async (source: string): Promise<string> => {
  // Read content from the file
  const fileContent = fs.readFileSync(source)
  const fileName = path.parse(source).base

  const uploadUrl = await generateSignedUploadURL(fileName)

  await putFile(fileContent, uploadUrl, {
    'Content-Type': mime.lookup(source) || 'application/octet-stream',
    'Cache-Control': 'public, max-age=604800, immutable',
  })

  const url = new URL(uploadUrl)
  return ['https://tapes.tape.sh', url.pathname].join('')
}

const uploadFileToBucket = async (
  source: string,
  bucketName: string
): Promise<string> => {
  // Read content from the file
  const fileContent = fs.readFileSync(source)
  const fileName = path.parse(source).base

  console.info(` ℹ️  Brought your own bucket: s3://${bucketName} \n`)

  const s3 = new AWS.S3({ apiVersion: '2006-03-01', signatureVersion: 'v4' })
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    ACL: 'public-read',
    ContentType: mime.lookup(source) || 'application/octet-stream',
  }

  const result = await s3.upload(params).promise()
  const url = result.Location
  return url
}

interface UploadFileOptions {
  copyToClipboard?: boolean
  log?: boolean
  fileType?: string
  format?: CopyFormats | undefined
}

/**
 * Uploads files and stuff
 * @param source Path to the file
 * @param options Optional configuration
 * @param options.copyToClipboard - Copy to clipboard
 * @param options.log - Friendly console.logs indicating progress
 * @param options.fileType - If log is set to true, gives the user more context in logs as to what kind of file is being uploaded
 * @example uploadFile(path, { copyToClipboard: true, log: true, fileType: 'Screenshot' })
 */
export const uploadFile = async (
  source: string,
  options: UploadFileOptions = {}
): Promise<string | null> => {
  const bucketName = await ConfigService.get('bucketName')
  if (options.log) {
    cli.action.start('🔗 Uploading file...')
  }

  let url

  try {
    if (bucketName) {
      url = await uploadFileToBucket(source, bucketName)
    } else {
      url = await uploadFileToTape(source)
    }

    const formattedLink = formatLink(
      url,
      options.format,
      options.copyToClipboard
    )

    if (options.log) {
      const clipboard = options.copyToClipboard
        ? `Copied ${options.format} to clipboard 🔖 ! `
        : ''

      cli.action.stop(
        `\n🎉 ${
          options.fileType || 'Screenshot'
        } uploaded. ${clipboard} -> \n ${formattedLink}`
      )
    }

    return url
  } catch (error) {
    cli.action.stop(`😨 ${chalk.redBright('Upload failed.')}`)
    throw error
  }
}
