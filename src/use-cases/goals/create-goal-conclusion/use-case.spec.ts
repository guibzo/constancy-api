import { db } from '@/db'
import { users } from '@/db/schema'
import { makeGoal } from '@/tests/factories/make-goal'
import { makeUser } from '@/tests/factories/make-user'
import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { createGoalConclusionUseCase } from './use-case'

describe('Create goal conclusion', () => {
  let gainedXPByCompletingGoal = 5
  let bonusXPByFullyCompletingGoal = 3

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

  it('should increase experience upon completing a goal', async () => {
    const user = await makeUser()

    const goal = await makeGoal({
      userId: user.id,
      desiredWeeklyFrequency: 7,
    })

    await createGoalConclusionUseCase({
      goalId: goal.id,
      userId: user.id,
    })

    const [userOnDB] = await db.select().from(users).where(eq(users.id, user.id))

    expect(userOnDB.experience).toEqual(gainedXPByCompletingGoal)
  })

  // it('should gain a bonus experience upon fully completing a goal based on desired weekly frequency', async () => {
  //   const user = await makeUser()

  //   const goal = await makeGoal({
  //     userId: user.id,
  //     desiredWeeklyFrequency: 7,
  //   })

  //   await Promise.all(
  //     Array.from({ length: 7 }).map(() =>
  //       createGoalConclusionUseCase({
  //         goalId: goal.id,
  //         userId: user.id,
  //       })
  //     )
  //   )

  //   const [userOnDB] = await db.select().from(users).where(eq(users.id, user.id))
  //   const totalExperience =
  //     gainedXPByCompletingGoal * 6 + (bonusXPByFullyCompletingGoal + gainedXPByCompletingGoal)

  //   expect(userOnDB.experience).toEqual(totalExperience)
  // })
})
