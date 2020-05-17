import * as AWS from 'aws-sdk'
import * as fs from 'fs'
import * as mime from 'mime-types'
import * as path from 'path'
import * as clipboardy from 'clipboardy'
import cli from 'cli-ux'

import ConfigService from '../services/config.service'

const uploadFileRaw = async (
  source: string,
  bucketName: string
): Promise<string> => {
  // Read content from the file
  const fileContent = fs.readFileSync(source)

  const key = path.parse(source).base
  const params = {
    Bucket: bucketName,
    Key: key, // File name you want to save as in S3
    Body: fileContent,
    ACL: 'public-read',
    ContentType: mime.lookup(source) || 'application/octet-stream',
  }

  const s3 = new AWS.S3({ apiVersion: '2006-03-01', signatureVersion: 'v4' })
  const result = await s3.upload(params).promise()
  // return result.Location.replace('s3.eu-west-2.amazonaws.com/', '')
  const url = result.Location

  return url
}

interface UploadFileOptions {
  copyToClipboard?: boolean
  log?: boolean
  fileType?: string
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
): Promise<string> => {
  const bucketName = await ConfigService.get('bucketName')
  if (options.log) {
    console.info(`ℹ️  Bucket name is s3://${bucketName} \n`)
    cli.action.start('🔗 Uploading file...')
  }

  const url = await uploadFileRaw(source, bucketName)

  if (options.copyToClipboard) {
    clipboardy.writeSync(url)
  }

  if (options.log) {
    const clipboard = options.copyToClipboard ?
      'Copied URL to clipboard 🔖 ! ' :
      ''

    cli.action.stop(
      `\n🎉 ${
        options.fileType || 'Screenshot'
      } uploaded. ${clipboard} -> \n ${url}`
    )
  }

  return url
}
