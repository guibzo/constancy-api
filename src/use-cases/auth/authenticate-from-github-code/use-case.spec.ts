import { db } from '@/db'
import { users } from '@/db/schema'
import * as github from '@/modules/auth/github-oauth'
import { makeUser } from '@/tests/factories/make-user'
import { and, eq, ne } from 'drizzle-orm'
import { beforeEach } from 'node:test'
import { describe, expect, it, vi } from 'vitest'
import { authenticateFromGitHubCodeUseCase } from './use-case'

describe('Authenticate from GitHub code', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.mock('@/modules/auth/github-oauth')
  })

  it('should be able to authenticate with github code', async () => {
    const userExternalAccountData = {
      id: 1234,
      name: 'Sample User',
      email: null,
      avatar_url: 'http://github.com/guibzo.png',
    }

    vi.spyOn(github, 'getUserFromGitHubAccessToken').mockResolvedValueOnce({
      ...userExternalAccountData,
    })

    const sut = await authenticateFromGitHubCodeUseCase({ code: 'sample-github-code' })

    expect(sut.token).toEqual(expect.any(String))

    const [userOnDb] = await db
      .select()
      .from(users)
      .where(eq(users.externalAccountId, userExternalAccountData.id))

    expect(userOnDb).toEqual(
      expect.objectContaining({
        name: userExternalAccountData.name,
        email: userExternalAccountData.email,
        avatarURL: userExternalAccountData.avatar_url,
        externalAccountId: userExternalAccountData.id,
        id: expect.any(String),
      })
    )
  })

  it('should be able to authenticate with existing github user', async () => {
    const existingUserName = 'Random name'

    const existingUser = await makeUser({
      name: existingUserName,
    })

    const userExternalAccountData = {
      id: existingUser.externalAccountId,
      name: 'Unknown external account user name',
      email: null,
      avatar_url: 'http://github.com/guibzo.png',
    }

    await db
      .delete(users)
      .where(
        and(
          eq(users.externalAccountId, existingUser.externalAccountId),
          ne(users.id, existingUser.id)
        )
      )

    vi.spyOn(github, 'getUserFromGitHubAccessToken').mockResolvedValueOnce({
      ...userExternalAccountData,
    })

    const sut = await authenticateFromGitHubCodeUseCase({ code: 'sample-github-code' })

    expect(sut.token).toEqual(expect.any(String))

    const [userOnDb] = await db
      .select()
      .from(users)
      .where(eq(users.externalAccountId, userExternalAccountData.id))

    expect(userOnDb.name).toEqual(existingUserName)
  })
})
