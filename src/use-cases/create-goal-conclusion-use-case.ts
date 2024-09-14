import { db } from '@/db'
import { goalConclusions, goals } from '@/db/schema'
import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

type CreateGoalConclusionRequest = {
  goalId: string
}

export const createGoalConclusionUseCase = async ({ goalId }: CreateGoalConclusionRequest) => {
  const lastDayOfCurrentWeek = dayjs().endOf('week').toDate()
  const firstDayOfCurrentWeek = dayjs().startOf('week').toDate()

  const goalConclusionsCount = db.$with('goal_conclusions_count').as(
    db
      .select({
        goalId: goalConclusions.goalId,
        conclusionCount: count(goalConclusions.id).as('conclusionCount'),
      })
      .from(goalConclusions)
      .where(
        and(
          gte(goalConclusions.createdAt, firstDayOfCurrentWeek),
          lte(goalConclusions.createdAt, lastDayOfCurrentWeek),
          eq(goalConclusions.goalId, goalId)
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
    .where(eq(goals.id, goalId))
    .limit(1)

  const { conclusionCount, desiredWeeklyFrequency } = result[0]

  if(conclusionCount >= desiredWeeklyFrequency) {
    throw new Error('Goal already completed this week')
  }

  const insertResult = await db
    .insert(goalConclusions)
    .values({ goalId })
    .returning()

  const goalConclusion = insertResult[0]

  return {
    goalConclusion,
  }
}
