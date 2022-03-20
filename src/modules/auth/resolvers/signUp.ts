import bcrypt from 'bcrypt'
import { GraphQLContext } from 'config/context'
import createAuthResponse from '../lib/createAuthResponse'
import { MutationResolvers } from 'modules/types.generated'

const signUp: MutationResolvers['signUp'] = async (_, { data }, { prisma, res }: GraphQLContext) => {
  const { email, password } = data

  const existing = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (existing) {
    return {
      __typename: 'AuthError',
      message: 'user already exists',
    }
  }

  const encryptedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: encryptedPassword,
    },
  })

  // if (!user) {
  //   return {
  //     __typename: 'AuthError',
  //     message: 'unable to create new user',
  //   }
  // }

  return createAuthResponse(user, prisma, res)
}
export default signUp
