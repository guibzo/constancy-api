import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

type GetUserRequest = {
  userId: string
}

export const getUserUseCase = async ({ userId }: GetUserRequest) => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarURL: users.avatarURL,
      experience: users.experience,
    })
    .from(users)
    .where(eq(users.id, userId))

  const user = result[0]

  return {
    user,
  }
}
