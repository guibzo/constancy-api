import { db } from '@/db'
import { goalConclusions, goals, users } from '@/db/schema'
import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

type CreateGoalConclusionRequest = {
  goalId: string
  userId: string
}

export const createGoalConclusionUseCase = async ({
  goalId,
  userId,
}: CreateGoalConclusionRequest) => {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalConclusionCounts = db.$with('goal_conclusion_counts').as(
    db
      .select({
        goalId: goalConclusions.goalId,
        conclusionCount: count(goalConclusions.id).as('conclusionCount'),
      })
      .from(goalConclusions)
      .innerJoin(goals, eq(goals.id, goalConclusions.goalId))
      .where(
        and(
          gte(goalConclusions.createdAt, firstDayOfWeek),
          lte(goalConclusions.createdAt, lastDayOfWeek),
          eq(goalConclusions.goalId, goalId),
          eq(goals.userId, userId)
        )
      )
      .groupBy(goalConclusions.goalId)
  )

  const result = await db
    .with(goalConclusionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      conclusionCount: sql`
        COALESCE(${goalConclusionCounts.conclusionCount}, 0)
      `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalConclusionCounts, eq(goalConclusionCounts.goalId, goals.id))
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1)

  const { conclusionCount, desiredWeeklyFrequency } = result[0]

  if (conclusionCount >= desiredWeeklyFrequency) {
    throw new Error('Goal already completed this week')
  }

  const isLastConclusionFromGoal = conclusionCount + 1 === desiredWeeklyFrequency
  const earnedExperience = isLastConclusionFromGoal ? 8 : 5

  const goalConclusion = await db.transaction(async (tx) => {
    const [goalConclusion] = await db.insert(goalConclusions).values({ goalId }).returning()

    await db
      .update(users)
      .set({ experience: sql`${users.experience} + ${earnedExperience}` })
      .where(eq(users.id, userId))

    return goalConclusion
  })

  return {
    goalConclusion,
  }
}
