import { db } from '@/db'
import { goalConclusions, goals } from '@/db/schema'
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
  const lastDayOfWeek = dayjs().endOf('week').toDate()
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  const goalConclusionsCount = db.$with('goal_conclusions_count').as(
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
    .with(goalConclusionsCount)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      conclusionCount: sql`
        COALESCE(${goalConclusionsCount.conclusionCount}, 0)
      `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalConclusionsCount, eq(goalConclusionsCount.goalId, goals.id))
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1)

  const { conclusionCount, desiredWeeklyFrequency } = result[0]

  if (conclusionCount >= desiredWeeklyFrequency) {
    throw new Error('Goal already completed this week')
  }

  const insertResult = await db.insert(goalConclusions).values({ goalId }).returning()

  const goalConclusion = insertResult[0]

  return {
    goalConclusion,
  }
}
