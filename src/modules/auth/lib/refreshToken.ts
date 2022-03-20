import jwt, { JsonWebTokenError } from 'jsonwebtoken'

//TODO cerate env var
const secret = 'shaunoffshaunoffshaunoffshaunoffshaunoffshaunoffshaunoffshaunoffshaunoffshaunoffshaunoff'

export const createRefreshToken = (id: string): string =>
  jwt.sign(
    {
      id,
    },
    secret,
    {
      algorithm: 'HS256',
      expiresIn: 10000000,
    },
  )

export const validateRefreshToken = (token: string) => {
  try {
    jwt.verify(token, secret)
    return true
  } catch (error) {
    const jwtError = error as JsonWebTokenError
    return jwtError.message
  }
}
