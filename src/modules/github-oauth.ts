import { env } from '@/env'

type GetAccessTokenResponse = {
  access_token: string
}

export const getAccessTokenFromGitHubCode = async (code: string) => {
  const githubURL = new URL('https://github.com/login/oauth/access_token')
  const githubURLParams = new URLSearchParams([
    ['client_id', env.GITHUB_CLIENT_ID],
    ['client_secret', env.GITHUB_CLIENT_SECRET],
    ['code', code],
  ])
  const authenticateWithGitHubURL = `${githubURL}?${githubURLParams.toString()}`

  const { access_token }: GetAccessTokenResponse = await fetch(authenticateWithGitHubURL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  }).then((res) => res.json())

  const accessToken = access_token

  return accessToken
}

type GetUserResponse = {
  id: number
  name: string | null
  email: string | null
  avatar_url: string
}

export const getUserFromGitHubAccessToken = async (accessToken: string) => {
  const user: GetUserResponse = await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json())

  return user
}
