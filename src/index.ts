import createServer from './config/createServer'
import * as dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
  console.log('kkk', process.env.NODE_ENV)
  dotenv.config()
}

const port = process.env.PORT || '4000'

const startServer = async () => {
  const { httpServer } = await createServer()

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve))
  console.log(`🚀 Server ready at http://localhost:${port}`)
}

startServer()
