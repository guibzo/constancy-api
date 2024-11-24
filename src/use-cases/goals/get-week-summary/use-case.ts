import { db } from '@/db'
import { goalConclusions, goals } from '@/db/schema'
import dayjs from 'dayjs'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

type GetWeekSummaryRequest = {
  userId: string
  weekStartsAt: Date
}

export const getWeekSummaryUseCase = async ({ userId, weekStartsAt }: GetWeekSummaryRequest) => {
  const firstDayOfWeek = weekStartsAt
  const lastDayOfWeek = dayjs(weekStartsAt).endOf('week').toDate()

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

  const goalsCompletedInWeek = db.$with('goals_completed_in_week').as(
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
          gte(goalConclusions.createdAt, firstDayOfWeek),
          lte(goalConclusions.createdAt, lastDayOfWeek),
          eq(goals.userId, userId)
        )
      )
      .orderBy(desc(goalConclusions.createdAt))
  )

  const goalsCompletedByWeekDay = db.$with('goals_completed_by_week_day').as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        conclusions: sql`
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${goalsCompletedInWeek.id},
              'title', ${goalsCompletedInWeek.title},
              'completedAt', ${goalsCompletedInWeek.completedAt}
            )
          )
        `.as('conclusions'),
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate)
      .orderBy(desc(goalsCompletedInWeek.completedAtDate))
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
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(Number),
      total:
        // TODO: fix this
        sql`(SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql<GoalsPerDay>`
        JSON_OBJECT_AGG(
          ${goalsCompletedByWeekDay.completedAtDate},
          ${goalsCompletedByWeekDay.conclusions}
        )
      `,
    })
    .from(goalsCompletedByWeekDay)

  return {
    summary: result[0],
  }
}
