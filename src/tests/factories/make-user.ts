import { db } from '@/db'
import { users } from '@/db/schema'
import { faker } from '@faker-js/faker'
import type { InferSelectModel } from 'drizzle-orm'

export const makeUser = async (override: Partial<InferSelectModel<typeof users>> = {}) => {
  const [result] = await db
    .insert(users)
    .values({
      name: faker.person.fullName(),
      externalAccountId: faker.number.int({ min: 1, max: 1_000_000 }),
      email: faker.internet.email(),
      experience: 0,
      avatarURL: faker.image.avatarGitHub(),
      ...override,
    })
    .returning()

  return result
}
