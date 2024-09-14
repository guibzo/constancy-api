import { db } from '@/db'
import { goals } from '@/db/schema'

type CreateGoalRequest = {
  title: string
  desiredWeeklyFrequency: number
}

export const createGoalUseCase = async ({ title, desiredWeeklyFrequency }: CreateGoalRequest) => {
  const result = await db.insert(goals).values([{ title, desiredWeeklyFrequency }]).returning()

  const goal = result[0]

  return {
    goal,
  }
}
