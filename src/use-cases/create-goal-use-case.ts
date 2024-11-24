import { db } from '@/db'
import { goals } from '@/db/schema'

type CreateGoalRequest = {
  title: string
  desiredWeeklyFrequency: number
  userId: string
}

export const createGoalUseCase = async ({
  title,
  desiredWeeklyFrequency,
  userId,
}: CreateGoalRequest) => {
  const result = await db
    .insert(goals)
    .values([{ title, desiredWeeklyFrequency, userId }])
    .returning()

  const goal = result[0]

  return {
    goal,
  }
}
