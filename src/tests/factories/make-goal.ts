import { db } from '@/db'
import { goals } from '@/db/schema'
import { faker } from '@faker-js/faker'
import type { InferSelectModel } from 'drizzle-orm'

export const makeGoal = async (
  override: Partial<InferSelectModel<typeof goals>> & Pick<InferSelectModel<typeof goals>, 'userId'>
) => {
  const [result] = await db
    .insert(goals)
    .values({
      title: faker.lorem.sentence(),
      desiredWeeklyFrequency: faker.number.int({ min: 1, max: 7 }),
      ...override,
    })
    .returning()

  return result
}
