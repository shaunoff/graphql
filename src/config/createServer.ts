import schema from '../modules'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import express from 'express'
import cookieParser from 'cookie-parser'
import http from 'http'
import { contextFactory } from './context'

const createServer = async () => {
  // Required logic for integrating with Express
  const app = express()
  app.use(cookieParser())
  const httpServer = http.createServer(app)

  const apolloServer = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: contextFactory,
  })

  // More required logic for integrating with Express
  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    path: '/',
    cors: {
      origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
      credentials: true,
    },
  })

  /**
   * We return both httpServer and ApolloServer instance.
   * Only the httpServer is required to run the server but
   * the ApolloServer instance is needed to customize requests
   * and responses for testing.
   * */
  return { httpServer, apolloServer }
}

export default createServer
