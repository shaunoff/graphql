import prisma from './prismaClient'
import { PrismaClient } from '@prisma/client'
import { Response } from 'express'

export type GraphQLContext = {
  prisma: PrismaClient
  // user: User | null
  accessToken?: string
  req: CustomRequest
  res: Response
  //   currentUser: User | null;
  //   pubSub: typeof pubSub;
}

type ContextFactory = ({ req, res }: { req: CustomRequest; res: Response }) => Promise<GraphQLContext>
export const contextFactory: ContextFactory = async ({ req, res }) => {
  const accessToken = req.headers.authorization
  //TODO get user information from accessToken so no database call required,
  // const user = await userFromToken({ accessToken, prisma })
  return {
    prisma,
    accessToken,
    req,
    res,
  }
}
