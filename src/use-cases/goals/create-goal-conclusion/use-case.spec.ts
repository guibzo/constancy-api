import { makeGoal } from '@/tests/factories/make-goal'
import { makeUser } from '@/tests/factories/make-user'
import { describe, expect, it } from 'vitest'
import { createGoalConclusionUseCase } from './use-case'

describe('Create goal conclusion', () => {
  it('should be able to conclude a goal', async () => {
    const user = await makeUser()

    const goal = await makeGoal({
      userId: user.id,
    })

    const result = await createGoalConclusionUseCase({
      goalId: goal.id,
      userId: user.id,
    })

    expect(result).toEqual(
      expect.objectContaining({
        goalConclusion: expect.objectContaining({
          id: expect.any(String),
          goalId: goal.id,
        }),
      })
    )
  })
})
