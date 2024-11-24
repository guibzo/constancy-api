import { db } from '@/db'
import { goalConclusions } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export const makeGoalConclusion = async (
  override: Partial<InferSelectModel<typeof goalConclusions>> &
    Pick<InferSelectModel<typeof goalConclusions>, 'goalId'>
) => {
  const [result] = await db.insert(goalConclusions).values(override).returning()

  return result
}
