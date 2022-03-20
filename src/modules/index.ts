import path from 'path'
import fs from 'fs'
import { print } from 'graphql'

import { makeExecutableSchema } from '@graphql-tools/schema'

import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge'

const typesArray = loadFilesSync(path.join(__dirname, '.'), { recursive: true, extensions: ['graphql'] })
const resolversArray = loadFilesSync(path.join(__dirname, './**/*.resolvers.ts'))

const typeDefs = mergeTypeDefs(typesArray)
const resolvers = mergeResolvers(resolversArray)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const printedTypeDefs = print(typeDefs)
fs.writeFileSync('src/modules/schema.graphql', printedTypeDefs)

export default schema
