import { db } from '@/db'
import { goalConclusions, goals } from '@/db/schema'
import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

export const geetWeekPendingGoalsUseCase = async () => {
  const lastDayOfCurrentWeek = dayjs().endOf('week').toDate()
  const firstDayOfCurrentWeek = dayjs().startOf('week').toDate()

  const goalsCreatedUpToCurrentWeek = db.$with('goals_created_up_to_current_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfCurrentWeek))
  )

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
          lte(goalConclusions.createdAt, lastDayOfCurrentWeek)
        )
      )
      .groupBy(goalConclusions.goalId)
  )

  const pendingGoals = await db
    .with(goalsCreatedUpToCurrentWeek, goalConclusionsCount)
    .select({
      id: goalsCreatedUpToCurrentWeek.id,
      title: goalsCreatedUpToCurrentWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToCurrentWeek.desiredWeeklyFrequency,
      conclusionCount: sql`
        COALESCE(${goalConclusionsCount.conclusionCount}, 0)
      `
        .mapWith(Number)
        .as('conclusionCount'),
    })
    .from(goalsCreatedUpToCurrentWeek)
    .leftJoin(goalConclusionsCount, eq(goalConclusionsCount.goalId, goalsCreatedUpToCurrentWeek.id))

  return {
    pendingGoals,
  }
}
