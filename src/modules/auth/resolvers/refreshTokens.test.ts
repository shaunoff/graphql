import gql from 'graphql-tag'
import { Server } from 'http'
import createTestClient, { TestQuery, TestSetOptions } from 'tests/createTestClient'
import { createAccessToken } from '../lib/accessToken'
import prisma from 'config/prismaClient'
import { RefreshTokensMutation, RefreshTokensMutationVariables } from 'modules/types.generated'
import createAuthResponse, { createFingerprint } from '../lib/createAuthResponse'
import { Response } from 'express'

const signInMutation = gql`
  mutation RefreshTokens($refreshToken: String!) {
    refreshTokens(refreshToken: $refreshToken) {
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

describe('refreshToken Resolver', () => {
  let mutation: TestQuery
  let stop: () => Promise<Server>
  let setOptions: TestSetOptions

  beforeAll(async () => {
    const client = await createTestClient({})
    mutation = client.mutation
    stop = client.stop
    setOptions = client.setOptions
  })

  afterAll(async () => await stop())

  test('No accessToken in headers', async () => {
    const res = await mutation<RefreshTokensMutation, RefreshTokensMutationVariables>(signInMutation, {
      variables: {
        refreshToken: 'gfdhjfgjhdsf',
      },
    })
    expect(res?.data?.refreshTokens).toEqual({
      message: 'missing access token to refresh accessToken',
    })
  })
  test('AccessToken but no fingerprint cookie', async () => {
    setOptions({
      request: {
        headers: {
          authorization: 'fake access token',
        },
      },
    })
    const res = await mutation<RefreshTokensMutation, RefreshTokensMutationVariables>(signInMutation, {
      variables: {
        refreshToken: 'fake refreshToken',
      },
    })
    expect(res?.data?.refreshTokens).toEqual({
      message: 'missing fingerprint to refresh accessToken',
    })
  })
  test('malformed AccessToken', async () => {
    setOptions({
      request: {
        headers: {
          authorization: 'fake access token',
        },
        cookies: {
          fingerprint: 'fhjkdfhdsjkhjk',
        },
      },
    })
    const res = await mutation<RefreshTokensMutation, RefreshTokensMutationVariables>(signInMutation, {
      variables: {
        refreshToken: 'fake refreshToken',
      },
    })
    expect(res?.data?.refreshTokens).toEqual({
      message: 'jwt malformed',
    })
  })
  test('invalid access token', async () => {
    setOptions({
      request: {
        headers: {
          authorization:
            'ezJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg3MmM3OTM4LTZiMTMtNGRlZS05YjllLTRmMTc2M2IwOWYyNCIsImVtYWlsIjoic2hhdW5Ac2hhdW4uY29tIiwiZmluZ2VycHJpbnRIYXNoIjoiNjczNzVkNGJhMWEzMjRjODFlNzI0MmFiYmY3NWM4ZGM4NzI4MWZiOWIzNGE3ZTYxZGI5YTg4YjgwYjUyNWRjYiIsImlhdCI6MTY0NzY2MDM3NiwiZXhwIjoxNjQ3NjYyMTc2fQ.DaSRKApTMvmGzAtgF3-JkadD8BAocpZ52lHi3nEZUrA',
        },
        cookies: {
          fingerprint: 'fhjkdfhdsjkhjk',
        },
      },
    })
    const res = await mutation<RefreshTokensMutation, RefreshTokensMutationVariables>(signInMutation, {
      variables: {
        refreshToken: 'fake refreshToken',
      },
    })
    expect(res?.data?.refreshTokens).toEqual({
      message: 'invalid token',
    })
  })
  test('Valid access token, invalid fingerprint cookie', async () => {
    const user = await prisma.user.findFirst({ where: { email: 'shaun@shaun.com' } })
    if (!user) {
      return
    }
    const authorization = createAccessToken(user, 'randomString')
    setOptions({
      request: {
        headers: {
          authorization,
        },
        cookies: {
          fingerprint: 'falsefingerprint',
        },
      },
    })
    const res = await mutation<RefreshTokensMutation, RefreshTokensMutationVariables>(signInMutation, {
      variables: {
        refreshToken: 'fake refreshToken',
      },
    })
    expect(res?.data?.refreshTokens).toEqual({
      message: 'fingerprints do not match',
    })
  })
  test('Valid access token and fingerprint cookie, invalid refresh token', async () => {
    const fingerprint = createFingerprint()
    const user = await prisma.user.findFirst({ where: { email: 'shaun@shaun.com' } })
    if (!user) {
      return
    }
    const authorization = createAccessToken(user, fingerprint)
    setOptions({
      request: {
        headers: {
          authorization,
        },
        cookies: {
          fingerprint: fingerprint,
        },
      },
    })
    const res = await mutation<RefreshTokensMutation, RefreshTokensMutationVariables>(signInMutation, {
      variables: {
        refreshToken:
          'ezJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg3MmM3OTM4LTZiMTMtNGRlZS05YjllLTRmMTc2M2IwOWYyNCIsImVtYWlsIjoic2hhdW5Ac2hhdW4uY29tIiwiZmluZ2VycHJpbnRIYXNoIjoiNjczNzVkNGJhMWEzMjRjODFlNzI0MmFiYmY3NWM4ZGM4NzI4MWZiOWIzNGE3ZTYxZGI5YTg4YjgwYjUyNWRjYiIsImlhdCI6MTY0NzY2MDM3NiwiZXhwIjoxNjQ3NjYyMTc2fQ.DaSRKApTMvmGzAtgF3-JkadD8BAocpZ52lHi3nEZUrA',
      },
    })
    expect(res?.data?.refreshTokens).toEqual({
      message: 'invalid token',
    })
  })
  test('Valid access token, fingerprint cookie and refresh token', async () => {
    let authResponseFingerprint = ''
    const user = await prisma.user.findFirst({ where: { email: 'shaun@shaun.com' } })
    if (!user) {
      return
    }
    const auth = await createAuthResponse(user, prisma, {
      /**this mocks the cookie making process and extracts the fingerprint produced */
      cookie: (name: string, fingerprint: string) => {
        authResponseFingerprint = fingerprint
      },
    } as unknown as Response)

    if (auth.__typename === 'Auth') {
      setOptions({
        request: {
          headers: {
            authorization: auth.accessToken,
          },
          cookies: {
            fingerprint: authResponseFingerprint,
          },
        },
      })
      const res = await mutation<RefreshTokensMutation, RefreshTokensMutationVariables>(signInMutation, {
        variables: {
          refreshToken: auth.refreshToken,
        },
      })
      expect(res?.data?.refreshTokens).toHaveProperty('accessToken')
    }
  })

  test('Revoked Refresh token', async () => {
    let authResponseFingerprint = ''
    const user = await prisma.user.findFirst({ where: { email: 'shaun@shaun.com' } })
    if (!user) {
      return
    }
    const auth = await createAuthResponse(user, prisma, {
      /**this mocks the cookie making process and extracts the fingerprint produced */
      cookie: (name: string, fingerprint: string) => {
        authResponseFingerprint = fingerprint
      },
    } as unknown as Response)

    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        refreshToken: '',
      },
    })

    if (auth.__typename === 'Auth') {
      setOptions({
        request: {
          headers: {
            authorization: auth.accessToken,
          },
          cookies: {
            fingerprint: authResponseFingerprint,
          },
        },
      })
      const res = await mutation<RefreshTokensMutation, RefreshTokensMutationVariables>(signInMutation, {
        variables: {
          refreshToken: auth.refreshToken,
        },
      })
      expect(res?.data?.refreshTokens).toEqual({
        message: 'stale refresh token',
      })
    }
  })
})
