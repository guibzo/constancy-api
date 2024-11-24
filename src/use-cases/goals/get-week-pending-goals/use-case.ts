import { db } from '@/db'
import { goalConclusions, goals } from '@/db/schema'
import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

type GetWeekPendingGoalsRequest = {
  userId: string
}

export const getWeekPendingGoalsUseCase = async ({ userId }: GetWeekPendingGoalsRequest) => {
  const lastDayOfWeek = dayjs().endOf('week').toDate()
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(and(lte(goals.createdAt, lastDayOfWeek), eq(goals.userId, userId)))
  )

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
          eq(goals.userId, userId)
        )
      )
      .groupBy(goalConclusions.goalId)
  )

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalConclusionsCount)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      conclusionCount: sql`
        COALESCE(${goalConclusionsCount.conclusionCount}, 0)
      `
        .mapWith(Number)
        .as('conclusionCount'),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(goalConclusionsCount, eq(goalConclusionsCount.goalId, goalsCreatedUpToWeek.id))

  return {
    pendingGoals,
  }
}
