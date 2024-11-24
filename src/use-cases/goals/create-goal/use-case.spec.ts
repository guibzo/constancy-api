import { makeUser } from '@/tests/factories/make-user'
import { describe, expect, it } from 'vitest'
import { createGoalUseCase } from './use-case'

describe('Create goal', () => {
  it('should be able to create a new goal', async () => {
    const user = await makeUser()

    const result = await createGoalUseCase({
      userId: user.id,
      desiredWeeklyFrequency: 5,
      title: 'Test title',
    })

    expect(result).toEqual(
      expect.objectContaining({
        goal: expect.objectContaining({
          id: expect.any(String),
          title: 'Test title',
          desiredWeeklyFrequency: 5,
          userId: user.id,
        }),
      })
    )
  })
})
