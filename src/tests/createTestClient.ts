import createServer from '../config/createServer'
import httpMocks, { RequestOptions, ResponseOptions } from 'node-mocks-http'
import { convertNodeHttpToRequest, runHttpQuery } from 'apollo-server-core'
import { DocumentNode, ExecutionResult, print } from 'graphql'

const port = process.env.PORT || '4009'

/** this allows us to mock the request object */
const mockRequest = (options: RequestOptions = {}) =>
  httpMocks.createRequest({
    method: 'POST',
    ...options,
  })
/** this allows us to mock the response object */
const mockResponse = (options: ResponseOptions = {}) => httpMocks.createResponse(options)

export type TestClientConfig = {
  // Extends the mocked Request object with additional keys.
  // Useful when your apolloServer `context` option is a callback that operates on the passed in `req` key,
  // and you want to inject data into that `req` object.
  extendMockRequest?: RequestOptions
  // Extends the mocked Response object with additional keys.
  // Useful when your apolloServer `context` option is a callback that operates on the passed in `res` key,
  // and you want to inject data into that `res` object
  extendMockResponse?: ResponseOptions
}

export type Options<T extends object> = { variables?: T }

export type TestQuery = <T extends object = Record<string, never>, V extends object = Record<string, never>>(
  operation: DocumentNode,
  options?: Options<V>,
) => Promise<ExecutionResult<T>>

export type TestSetOptions = (options: { request?: RequestOptions; response?: ResponseOptions }) => void

const createTestClient = async ({ extendMockRequest, extendMockResponse }: TestClientConfig) => {
  const { httpServer, apolloServer } = await createServer()

  let mockRequestOptions = extendMockRequest
  let mockResponseOptions = extendMockResponse

  /**
   * this allows us to set request data  after the server has been instantiated
   */
  const setOptions: TestSetOptions = ({
    request,
    response,
  }: {
    request?: RequestOptions
    response?: ResponseOptions
  }) => {
    if (request) {
      mockRequestOptions = request
    }
    if (response) {
      mockResponseOptions = response
    }
  }

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve))

  /**
   * this executes any queries or mutations on the test server
   */
  const executeOperation: TestQuery = async <
    T extends object = Record<string, never>,
    V extends object = Record<string, never>,
  >(
    operation: DocumentNode,
    { variables }: Options<V> = {},
  ) => {
    const req = mockRequest(mockRequestOptions)
    const res = mockResponse(mockResponseOptions)

    const graphQLOptions = await apolloServer.createGraphQLServerOptions(req, res)

    const { graphqlResponse } = await runHttpQuery([req, res], {
      method: 'POST',
      options: graphQLOptions,
      query: {
        // operation can be a string or an AST, but `runHttpQuery` only accepts a string
        query: print(operation),
        variables,
      },
      request: convertNodeHttpToRequest(req),
    })

    return JSON.parse(graphqlResponse) as T
  }

  return {
    query: executeOperation,
    mutation: executeOperation,
    stop: async () => {
      console.log(
        'hfdsghjdfgdhjsfgsdjhfgjhsdgfjhsdgfjhsdgfjhdsgfjhsdgjhfgsdjhfgjsdhgfjhsdgfjhgsdjfhgsdjhgfjhsdgfjhsdgjhfgsdjhfgjhsdgfjhgsdjhfghj',
      )
      return await httpServer.close()
    },
    setOptions,
  }
}

export default createTestClient
