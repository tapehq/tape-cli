import { isEmpty } from 'lodash'
import * as os from 'os'

import { ConfigService } from '../services'
import { TAPE_HOST } from '../services/config.service'
import { GraphQLClient } from 'graphql-request'

const { version } = require('../../package.json')

export const createQlClient = async () => {
  const accessToken = await ConfigService.get('token')

  if (isEmpty(accessToken)) {
    throw new Error('Please login, run: tape login or tape config')
  }

  return new GraphQLClient(`${TAPE_HOST}/.netlify/functions/graphql`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'auth-provider': 'cli',
      'User-Agent': `tape-cli/${version} ${os.platform}/${os.version}`,
    },
  })
}

interface QlError {
  message: string
  extensions?: {
    code: string
  }
}

// @TODO find type of error here
export const handleError = (error: any) => {
  if (error?.response?.errors[0]?.extensions.code === 'UNAUTHENTICATED') {
    throw new Error(
      'Authentication error. Try again after running -> tape login '
    )
  }

  if (error?.response?.errors) {
    throw new Error(
      error?.response?.errors.map((error: QlError) => error.message)
    )
  }

  throw error
}
