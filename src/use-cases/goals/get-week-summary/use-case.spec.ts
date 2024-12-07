import { makeGoal } from '@/tests/factories/make-goal'
import { makeGoalConclusion } from '@/tests/factories/make-goal-conclusion'
import { makeUser } from '@/tests/factories/make-user'
import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { getWeekSummaryUseCase } from './use-case'

describe('Get week summary', () => {
  it('should be able to get week summary', async () => {
    const user = await makeUser()

    const weekStartsAt = dayjs(new Date(2024, 9, 6)) // October 6th, 2024. Sunday.
      .startOf('week')
      .toDate()

    const [goal1, goal2, goal3] = await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        makeGoal({
          userId: user.id,
          desiredWeeklyFrequency: i + 1,
          createdAt: weekStartsAt,
        })
      )
    )

    await Promise.all([
      Array.from({ length: 2 }).map(() =>
        makeGoalConclusion({
          goalId: goal1.id,
          createdAt: dayjs(weekStartsAt).add(2, 'days').toDate(),
        })
      ),
      makeGoalConclusion({
        goalId: goal2.id,
        createdAt: dayjs(weekStartsAt).add(3, 'days').toDate(),
      }),
      makeGoalConclusion({
        goalId: goal3.id,
        createdAt: dayjs(weekStartsAt).add(5, 'days').toDate(),
      }),
    ])

    const result = await getWeekSummaryUseCase({
      userId: user.id,
      weekStartsAt,
    })

    expect(result).toEqual({
      summary: expect.objectContaining({
        total: 6,
        completed: 4,
        goalsPerDay: expect.objectContaining({
          '2024-10-08': expect.arrayContaining([
            expect.objectContaining({
              title: goal1.title,
            }),
          ]),
          '2024-10-09': expect.arrayContaining([
            expect.objectContaining({
              title: goal2.title,
            }),
          ]),
          '2024-10-11': expect.arrayContaining([
            expect.objectContaining({
              title: goal3.title,
            }),
          ]),
        }),
      }),
    })
  })
})
