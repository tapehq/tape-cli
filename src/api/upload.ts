import axios from 'axios'
import { ConfigService } from '../services'

export const generateSignedUploadURL = async (
  fileName: string
): Promise<string> => {
  const accessToken = await ConfigService.get('token')

  const { data } = await axios.post(
    'http://localhost:8911/graphql',
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
