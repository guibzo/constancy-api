import dayjs from 'dayjs'
import { client, db } from "."
import { goalConclusions, goals } from './schema'

const seed = async () => {
  await db.delete(goalConclusions)
  await db.delete(goals)

  const result = await db.insert(goals).values([
    { title: 'Get a job', desiredWeeklyFrequency: 5 },
    { title: 'Get a promotion', desiredWeeklyFrequency: 10 },
    { title: 'Get a raise', desiredWeeklyFrequency: 20 },
    { title: 'Get a test', desiredWeeklyFrequency: 25 },
    { title: 'Get a bonus', desiredWeeklyFrequency: 30 },
  ]).returning()

  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalConclusions).values([
    { goalId: result[0].id, createdAt: startOfWeek.toDate() },
    { goalId: result[1].id, createdAt: startOfWeek.add(1, 'day').toDate() },
    { goalId: result[2].id, createdAt: startOfWeek.add(2, 'day').toDate() },
    { goalId: result[3].id, createdAt: startOfWeek.add(3, 'day').toDate() },
    { goalId: result[4].id, createdAt: startOfWeek.add(4, 'day').toDate() },
  ])
}

seed().finally(() => {
  client.end()
})