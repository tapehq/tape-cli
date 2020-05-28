import axios from 'axios'

export const generateSignedUploadURL = async (
  fileName: string
): Promise<string> => {
  const { data } = await axios.post(
    'http://localhost:8911/graphql',
    {
      query: `mutation createTape($fileName: String!) {
      createTape(fileName: $fileName) {
        url
        id
        user {
          name
        }
      }
    }`,
      operationName: 'createTape',
      variables: { fileName },
    },
    {
      headers: {
        authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNrYWlrOXo5bDAwMDAwZjlrZm5tbHFka2wiLCJlbWFpbCI6ImRhbm55Y2hvdWRodXJ5QGdtYWlsLmNvbSIsIm5hbWUiOiJEYW5pZWwgQ2hvdWRodXJ5IiwiY3JlYXRlZEF0IjoiMjAyMC0wNS0yMlQxODo1MjozNC4zNzdaIiwiaWF0IjoxNTkwNTc4NDU0LCJhdWQiOiJjbGkifQ.v3ksgtYXk8CjnZxibwlNXCSfjtBQsxTA2mE6M9zxq4sl79O97oKwuAKyvurEh-Z5ueTg3oi_g8MQbwxJS8Viat4IEcj02In-984bxCVAu6dxZlsPhdS5vB7v4AqrfzE1c8wvS8A9XAXDp6Vdz3tiDHSXfD2bqzDW_N5_WhFSCzqEeOnKDX2vBwTONc1o_IzFOQiSm3ywyjpUNJ89_gkmBeFB2L8pWBXN85ixrypemMsRFAnmTgqERh1FVJLAd5_vlEDcLxVuu4PeeDjSDbnguminWmzDuu5qXqir9q0TxiPDUBQqiQF1P7ZpeyC4EIRQfD8DF2TJBzEGOGH69vSIVcYY9Xp5KkT2PqfxicgYqoDCMDN3yfLVti99lYqkFhDDX5HRz_Hi9klAnFe-snNUMHzFzX09TjXrMIahZmM8eUcVHjAxGoaU-MWptYOsIILall5VZ9ytHrqpEnNvztbpKI65pUQEjmT-5C-GJj42GrNDD085HjCreKMP7nBSZntGVp0HL3Txb-kLV8V2Z_6F3bVPmaZF19WMloK-NuvJy-n4ato17K_hQztTCDzTEI9Pd1ev716czGbZEK8TEtfcxvviU0Qcx7BERBlP1hM8JnrTo_7Dk1P-tIxFSuNegXj3T_3fDdyDzd9q3PBZLqD-owcf8RlJx1J-N0XODWIdkoA',
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
