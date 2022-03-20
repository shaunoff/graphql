import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { User } from '../../types.generated'
import crypto from 'crypto'

//TODO cerate env var
const secret = 'shaunoffshaunoffshaunoffshaunoffshaunoffshaunoffshaunoffshaunoffshaunoffshaunoffshaunoff'

/** Access token contains some basic user info and a hashed fingerprint */
export const createAccessToken = ({ id, email }: User, fingerprint: string): string => {
  const accessTokenClaims: AccessTokenClaims = {
    id,
    email,
    fingerprintHash: crypto.createHash('sha256').update(fingerprint, 'utf8').digest('hex'),
  }
  return jwt.sign(
    {
      ...accessTokenClaims,
    },
    secret,
    {
      algorithm: 'HS256',
      expiresIn: 1800,
    },
  )
}

export const decodeAccessToken = (token: string) => {
  try {
    /**
     * Get the data from the token
     */
    return jwt.verify(token, secret, { ignoreExpiration: true }) as AccessTokenClaims
  } catch (error) {
    const jwtError = error as JsonWebTokenError
    return jwtError.message
  }
}

export type AccessTokenClaims = {
  id: string
  email: string
  fingerprintHash: string
}
