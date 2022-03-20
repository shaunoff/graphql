import { GraphQLContext } from 'config/context'
import { decodeAccessToken } from '../lib/accessToken'
import createAuthResponse from '../lib/createAuthResponse'
import { validateRefreshToken } from '../lib/refreshToken'
import { MutationResolvers } from 'modules/types.generated'
import crypto from 'crypto'

const refreshTokens: MutationResolvers['refreshTokens'] = async (
  _,
  { refreshToken },
  { prisma, res, accessToken, req }: GraphQLContext,
) => {
  const { fingerprint } = req.cookies

  /** all these are required to grant a new access/refresh token */

  if (!accessToken) {
    return {
      __typename: 'AuthError',
      message: 'missing access token to refresh accessToken',
    }
  }
  if (!fingerprint) {
    return {
      __typename: 'AuthError',
      message: 'missing fingerprint to refresh accessToken',
    }
  }

  const decodedAccessToken = decodeAccessToken(accessToken)

  if (typeof decodedAccessToken === 'string') {
    return {
      __typename: 'AuthError',
      message: decodedAccessToken,
    }
  }

  const { fingerprintHash } = decodedAccessToken
  const fingerprintCookieHash = crypto.createHash('sha256').update(fingerprint, 'utf8').digest('hex')

  if (fingerprintHash != fingerprintCookieHash) {
    return {
      __typename: 'AuthError',
      message: 'fingerprints do not match',
    }
  }

  const result = validateRefreshToken(refreshToken)

  if (typeof result === 'string') {
    return {
      __typename: 'AuthError',
      message: result,
    }
  }

  /**
   * find the user with the decoded ID
   */
  const user = await prisma.user.findUnique({
    where: {
      refreshToken,
    },
  })

  //TODO: this allows only one refresh token. Create family of tokens so that sessions an exist on different clients
  if (!user) {
    return {
      __typename: 'AuthError',
      message: 'stale refresh token',
    }
  }

  return createAuthResponse(user, prisma, res)
}

export default refreshTokens
