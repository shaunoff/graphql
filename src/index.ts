import createServer from './config/createServer'

console.log(process.env.NODE_ENV)

const port = process.env.PORT || '4000'

const startServer = async () => {
  const { httpServer } = await createServer()

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve))
  console.log(`🚀 Server ready at http://localhost:${port}`)
}

startServer()
