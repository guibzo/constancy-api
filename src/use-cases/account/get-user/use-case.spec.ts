import { makeUser } from '@/tests/factories/make-user'
import { describe, expect, it } from 'vitest'
import { getUserUseCase } from './use-case'

describe('Get user', () => {
  it('should be able to get a user', async () => {
    const user = await makeUser()

    const result = await getUserUseCase({ userId: user.id })

    const { externalAccountId, ...returningUserData } = user

    expect(result).toEqual(
      expect.objectContaining({
        user: {
          ...returningUserData,
        },
      })
    )
  })
})
