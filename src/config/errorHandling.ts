import { ExecutionResult, GraphQLError } from 'graphql'

const formatResult = (result: ExecutionResult) => {
  /** format the result of every request */
  const formattedResult: ExecutionResult = {
    data: result.data,
  }

  /**
   * Return Error if there is one
   */
  if (result.errors) {
    formattedResult.errors = result.errors.map(({ nodes, source, positions, path }) => {
      //TODO: Better logging here
      console.log({ nodes, source, positions, path })

      return new GraphQLError('Sorry, something went wrong', {
        nodes,
        source,
        positions,
        path,
        //TODO: What is this?
        originalError: null,

        extensions: {
          //TODO: add any custom data here
          timestamp: Date.now(),
        },
      })
    })
  }
  /**
   * Return the result if there is no error
   */
  return formattedResult
}

export default formatResult
