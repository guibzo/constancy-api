import { db } from '@/db'
import { goalConclusions, goals } from '@/db/schema'
import dayjs from 'dayjs'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

export const getWeekSummaryUseCase = async () => {
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

  const goalsCompletedInCurrentWeek = db.$with('goals_completed_in_current_week').as(
    db
      .select({
        id: goalConclusions.id,
        title: goals.title,
        completedAt: goalConclusions.createdAt,
        completedAtDate: sql`
          DATE(${goalConclusions.createdAt})
        `.as('completedAtDate'),
      })
      .from(goalConclusions)
      .innerJoin(goals, eq(goals.id, goalConclusions.goalId))
      .where(
        and(
          gte(goalConclusions.createdAt, firstDayOfCurrentWeek),
          lte(goalConclusions.createdAt, lastDayOfCurrentWeek)
        )
      )
      .orderBy(desc(goalConclusions.createdAt))
  )

  const goalsCompletedByCurrentWeekDay = db.$with('goals_completed_by_current_week_day').as(
    db
      .select({
        completedAtDate: goalsCompletedInCurrentWeek.completedAtDate,
        conclusions: sql`
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${goalsCompletedInCurrentWeek.id},
              'title', ${goalsCompletedInCurrentWeek.title},
              'completedAt', ${goalsCompletedInCurrentWeek.completedAt}
            )
          )
        `.as('conclusions'),
      })
      .from(goalsCompletedInCurrentWeek)
      .groupBy(goalsCompletedInCurrentWeek.completedAtDate)
      .orderBy(desc(goalsCompletedInCurrentWeek.completedAtDate))
  )

  type GoalsPerDay = Record<
    string,
    {
      id: string
      title: string
      completedAt: string
    }[]
  >

  const result = await db
    .with(goalsCreatedUpToCurrentWeek, goalsCompletedInCurrentWeek, goalsCompletedByCurrentWeekDay)
    .select({
      completed: sql`(SELECT COUNT(*) FROM ${goalsCompletedInCurrentWeek})`.mapWith(Number),
      total:
        sql`(SELECT SUM(${goalsCreatedUpToCurrentWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToCurrentWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql<GoalsPerDay>`
        JSON_OBJECT_AGG(
          ${goalsCompletedByCurrentWeekDay.completedAtDate},
          ${goalsCompletedByCurrentWeekDay.conclusions}
        )
      `,
    })
    .from(goalsCompletedByCurrentWeekDay)

  return {
    summary: result,
  }
}
