import axios from 'axios'
import { isEmpty } from 'lodash'

import { ConfigService } from '../services'

const TAPE_HOST = 'https://tape.sh'

// For local debugging
// const TAPE_HOST = 'http://localhost:8910'

export const generateSignedUploadURL = async (
  fileName: string
): Promise<string> => {
  const accessToken = await ConfigService.get('token')

  if (isEmpty(accessToken)) {
    throw new Error('Please login, run: tape login or tape config')
  }

  const { data } = await axios.post(
    `${TAPE_HOST}/.netlify/functions/graphql`,
    {
      query: `mutation createTape($fileName: String!) {
      createTape(fileName: $fileName) {
        url
      }
    }`,
      operationName: 'createTape',
      variables: { fileName },
    },
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'auth-provider': 'jwt',
      },
    }
  )

  return data.data.createTape.url
}

export const putFile = async (
  file: Buffer,
  signedUrl: string,
  headers: object
) => {
  return axios.put(signedUrl, file, {
    headers,
  })
}
