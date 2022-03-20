import { MutationResolvers } from 'modules/types.generated'
import signIn from './signIn'
import signUp from './signUp'
import refreshTokens from './refreshTokens'

export const Mutation: MutationResolvers = {
  signIn,
  signUp,
  refreshTokens,
}
