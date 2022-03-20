import { PrismaClient } from '@prisma/client'
import decodeToken from './decodeToken'

interface UserFromToken {
  accessToken?: string
  prisma: PrismaClient
}
const userFromToken = async ({ accessToken, prisma }: UserFromToken) => {
  try {
    if (!accessToken) return null
    const id = decodeToken(accessToken)

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  } catch (e) {
    return null
  }
}

export default userFromToken
