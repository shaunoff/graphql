import { QueryResolvers } from 'modules/types.generated'
import { GraphQLContext } from 'config/context'

export const Query: QueryResolvers = {
  users: async (root, args, { prisma }: GraphQLContext) => {
    return prisma.user.findMany({})
  },
  user: async (_, { id }, { prisma }: GraphQLContext) => {
    /**
     * Find the User using an ID
     */
    return prisma.user.findUnique({ where: { id } })
  },
}
