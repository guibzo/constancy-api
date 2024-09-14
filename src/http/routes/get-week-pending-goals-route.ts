import { geetWeekPendingGoalsUseCase } from '@/use-cases/get-week-pending-goals-use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const getWeekPendingGoalsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get('/week-pending-goals', async (request, reply) => {
    const { pendingGoals } = await geetWeekPendingGoalsUseCase()

    reply.send({ pendingGoals })
  })
}
