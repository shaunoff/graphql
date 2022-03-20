import gql from 'graphql-tag'
import { Server } from 'http'
import createTestClient, { TestQuery } from 'tests/createTestClient'
import { SignInMutation, SignInMutationVariables } from 'modules/types.generated'

const signInMutation = gql`
  mutation SignIn($data: SignInInput!) {
    signIn(data: $data) {
      ... on Auth {
        accessToken
        refreshToken
      }
      ... on AuthError {
        message
      }
    }
  }
`

describe('signIn resolver', () => {
  let mutation: TestQuery
  let stop: () => Promise<Server>

  beforeAll(async () => {
    const client = await createTestClient({})
    mutation = client.mutation
    stop = client.stop
  })

  afterAll(async () => await stop())

  test('Invalid user', async () => {
    const res = await mutation<SignInMutation, SignInMutationVariables>(signInMutation, {
      variables: {
        data: {
          email: 'wrong@wrong.com',
          password: 'password',
        },
      },
    })
    expect(res?.data?.signIn).toEqual({
      message: 'user not found',
    })
  })
  test('Invalid password', async () => {
    const res = await mutation<SignInMutation, SignInMutationVariables>(signInMutation, {
      variables: {
        data: {
          email: 'shaun@shaun.com',
          password: 'password',
        },
      },
    })
    expect(res?.data?.signIn).toEqual({
      message: 'invalid password',
    })
  })
  test('valid user', async () => {
    const res = await mutation<SignInMutation, SignInMutationVariables>(signInMutation, {
      variables: {
        data: {
          email: 'shaun@shaun.com',
          password: 'passowrd',
        },
      },
    })
    expect(res?.data?.signIn).toHaveProperty('accessToken')
  })
})
