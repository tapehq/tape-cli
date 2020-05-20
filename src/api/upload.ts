import axios from 'axios'

export const generateSignedUploadURL = async (
  fileName: string
): Promise<string> => {
  const { data } = await axios.get(
    'https://www.tape.sh/.netlify/functions/sign',
    // 'http://localhost:8911/sign',
    { params: { key: fileName } }
  )
  return data.url
}

export const putFile = async (
  file: Buffer,
  signedUrl: string,
  headers: object
) => {
  await axios.put(signedUrl, file, {
    headers,
  })
}
