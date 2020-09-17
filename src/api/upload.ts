import axios from 'axios'

import { bytesToSize } from '../helpers/utils'
import { createQlClient, handleError } from './client'

interface CreateTape {
  url: string
  tapeUrl: string
  shareUrl: string
  id: string
}

export const generateSignedUploadURL = async (
  fileName: string,
  contentType: string,
  metadata: object
) => {
  const qlClient = await createQlClient()

  const createTapeMutation = `
    mutation createTape($fileName: String!, $contentType: String, $metadata: TapeMetadataInput) {
      createTape(input: {
        fileName: $fileName
        contentType: $contentType
        metadata: $metadata
      }) {
        id
        url
        tapeUrl
        shareUrl
      }
    }
  `

  const variables = { fileName, contentType, metadata }

  try {
    const data: { createTape: CreateTape } = await qlClient.request(
      createTapeMutation,
      variables
    )

    return data.createTape
  } catch (error) {
    handleError(error)
  }
}

export const confirmTape = async (id: string) => {
  const qlClient = await createQlClient()

  const confirmTapeMutation = `mutation confirmTape($id: String!) {
    confirmTape(
      id: $id
    ) {
      fileSize
    }
  }`

  const variables = { id }

  const data = await qlClient.request(confirmTapeMutation, variables)

  const { fileSize } = data.confirmTape
  console.log(`File Size: ${bytesToSize(fileSize)}`)
}

export const putFile = async (
  file: Buffer,
  signedUrl: string,
  headers: object
) => {
  return axios.put(signedUrl, file, {
    headers,
    maxContentLength: Infinity,
  })
}
