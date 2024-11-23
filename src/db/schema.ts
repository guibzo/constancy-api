import { createId } from '@paralleldrive/cuid2'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name'),
  email: text('email'),
  avatarURL: text('avatar_url').notNull(),
  externalAccountId: integer('external_account_id').notNull().unique(),
})

export const goals = pgTable('goals', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  desiredWeeklyFrequency: integer('desired_weekly_frequency').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
})

export const goalConclusions = pgTable('goal_conclusions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

  goalId: text('goal_id')
    .references(() => goals.id)
    .notNull(),
})
