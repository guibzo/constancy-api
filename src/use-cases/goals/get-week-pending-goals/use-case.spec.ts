import { makeGoal } from '@/tests/factories/make-goal'
import { makeGoalConclusion } from '@/tests/factories/make-goal-conclusion'
import { makeUser } from '@/tests/factories/make-user'
import { describe, expect, it } from 'vitest'
import { getWeekPendingGoalsUseCase } from './use-case'

describe('Get week pending goals', () => {
  it('should be able to get week pending goals', async () => {
    const user = await makeUser()

    const [goal1, goal2] = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        makeGoal({
          userId: user.id,
        })
      )
    )

    await Promise.all([
      Array.from({ length: 2 }).map(() => makeGoalConclusion({ goalId: goal2.id })),
      makeGoalConclusion({ goalId: goal1.id }),
    ])

    const result = await getWeekPendingGoalsUseCase({
      userId: user.id,
    })

    expect(result.pendingGoals).toHaveLength(5)

    expect(result).toEqual(
      expect.objectContaining({
        pendingGoals: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            desiredWeeklyFrequency: expect.any(Number),
            conclusionCount: expect.any(Number),
          }),
        ]),
      })
    )

    expect(result).toEqual(
      expect.objectContaining({
        pendingGoals: expect.arrayContaining([
          expect.objectContaining({
            conclusionCount: 1,
            id: goal1.id,
          }),
          expect.objectContaining({
            conclusionCount: 2,
            id: goal2.id,
          }),
        ]),
      })
    )
  })
})
