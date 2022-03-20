import gql from 'graphql-tag'
import { Server } from 'http'
import prisma from 'config/prismaClient'
import createTestClient, { TestQuery } from 'tests/createTestClient'
import { SignUpMutation, SignUpMutationVariables } from 'modules/types.generated'

const signUpMutation = gql`
  mutation SignUp($data: SignupInput!) {
    signUp(data: $data) {
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

describe('signUp resolver', () => {
  const newEmail = 'shaun@shauntestingemil.com'
  let mutation: TestQuery
  let stop: () => Promise<Server>

  beforeAll(async () => {
    const client = await createTestClient({})
    mutation = client.mutation
    stop = client.stop
  })

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        email: newEmail,
      },
    })
    await stop()
  })
  test('Valid New User', async () => {
    const res = await mutation<SignUpMutation, SignUpMutationVariables>(signUpMutation, {
      variables: {
        data: {
          email: newEmail,
          password: 'passowrd',
        },
      },
    })
    expect(res?.data?.signUp).toHaveProperty('accessToken')
  })
  test('Existing User', async () => {
    const res = await mutation<SignUpMutation, SignUpMutationVariables>(signUpMutation, {
      variables: {
        data: {
          email: newEmail,
          password: 'password',
        },
      },
    })
    expect(res?.data?.signUp).toEqual({
      message: 'user already exists',
    })
  })
})
