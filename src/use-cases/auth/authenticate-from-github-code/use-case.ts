import { db } from '@/db'
import { users } from '@/db/schema'
import { authenticateUser } from '@/modules/auth/auth'
import {
  getAccessTokenFromGitHubCode,
  getUserFromGitHubAccessToken,
} from '@/modules/auth/github-oauth'
import { eq } from 'drizzle-orm'

type AuthenticateFromGitHubRequest = {
  code: string
}

type AuthenticateFromGitHubResponse = {
  token: string
}

export const authenticateFromGitHubCodeUseCase = async ({
  code,
}: AuthenticateFromGitHubRequest): Promise<AuthenticateFromGitHubResponse> => {
  const accessToken = await getAccessTokenFromGitHubCode(code)
  const githubUser = await getUserFromGitHubAccessToken(accessToken)

  const result = await db.select().from(users).where(eq(users.externalAccountId, githubUser.id))

  const userAlreadyExists = result.length > 0

  let userId: string | null

  if (userAlreadyExists) {
    userId = result[0].id
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        name: githubUser.name,
        email: githubUser.email,
        avatarURL: githubUser.avatar_url,
        externalAccountId: githubUser.id,
      })
      .returning()

    userId = newUser.id
  }

  const token = await authenticateUser(userId)

  return { token }
}
