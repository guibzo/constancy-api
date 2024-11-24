import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { getUserUseCase } from './use-case'

describe('Get user', () => {
  beforeEach(async () => {
    await db.delete(users).where(eq(users.id, '1'))
  })

  it('should be able to get a user', async () => {
    const userMockData = {
      name: 'John Doe',
      externalAccountId: 123456789,
      email: 'john.doe@example.com',
      avatarURL: 'https://example.com/avatar.png',
      id: '1',
    }

    await db.insert(users).values(userMockData)

    const result = await getUserUseCase({ userId: userMockData.id })

    const { externalAccountId, ...returningUserData } = userMockData

    expect(result).toEqual(
      expect.objectContaining({
        user: {
          ...returningUserData,
        },
      })
    )
  })
})
