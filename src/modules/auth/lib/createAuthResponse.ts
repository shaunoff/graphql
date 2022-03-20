import { User } from '@prisma/client'
import { Response } from 'express'
import { GraphQLContext } from '../../../config/context'
import { createAccessToken } from './accessToken'
import crypto from 'crypto'
import { createRefreshToken } from './refreshToken'
import { AuthPayload } from '../../types.generated'

/**
 * When user or tokens have been validated, create fingerprint, token and cookie
 * and return the relevant data.
 */
const createAuthResponse = async (
  user: User,
  prisma: GraphQLContext['prisma'],
  res: Response,
): Promise<AuthPayload> => {
  const fingerprint = createFingerprint()
  const accessToken = createAccessToken(user, fingerprint)
  const refreshToken = createRefreshToken(user.id)

  /**
   * Update user with new refresh token
   */
  const updatedUser = await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      refreshToken,
    },
  })

  if (!updatedUser)
    return {
      __typename: 'AuthError',
      message: 'Error updating user with new refresh token',
    }

  createFingerprintCookie(res, fingerprint)

  return {
    __typename: 'Auth',
    accessToken,
    refreshToken,
  }
}

/**
 * Generates a cryptographically strong pseudorandom string
 */
export const createFingerprint = () => {
  return crypto.randomBytes(50).toString('hex')
}

/**
 * Uses the generated fingerprint to create
 * a cookie and is added to the response
 * @param res - express response
 * @param fingerprint random string
 */
const createFingerprintCookie = (res: Response, fingerprint: string) => {
  /**
   * add fingerprint to httpOnly cookie
   */
  const maxAge = 1000 * 60 * 60 * 8 // 8 hours
  res.cookie('fingerprint', fingerprint, {
    //secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
    maxAge,
    path: '/',
  })
}

export default createAuthResponse
