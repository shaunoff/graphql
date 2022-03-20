import bcrypt from 'bcrypt'
import { MutationResolvers, MutationSignInArgs } from 'modules/types.generated'
import { GraphQLContext } from 'config/context'
import createAuthResponse from '../lib/createAuthResponse'

const signIn: MutationResolvers['signIn'] = async (
  _,
  { data }: MutationSignInArgs,
  { prisma, res }: GraphQLContext,
) => {
  const { email, password } = data

  /**
   * Get user from database
   **/
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) {
    return {
      __typename: 'AuthError',
      message: 'user not found',
    }
  }

  /**
   * Check if passwords match
   */
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return {
      __typename: 'AuthError',
      message: 'invalid password',
    }
  }
  return createAuthResponse(user, prisma, res)
}

export default signIn
