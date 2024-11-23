import { geetWeekPendingGoalsUseCase } from '@/use-cases/get-week-pending-goals-use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { authenticateUserMiddleware } from '../middlewares/authenticate-user'

export const getWeekPendingGoalsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/week-pending-goals',
    {
      onRequest: [authenticateUserMiddleware],
      schema: {
        description: 'Get week pending goals',
        tags: ['goals'],
        response: {
          200: z.object({
            pendingGoals: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                desiredWeeklyFrequency: z.number(),
                conclusionCount: z.number(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { pendingGoals } = await geetWeekPendingGoalsUseCase()

      reply.send({ pendingGoals })
    }
  )
}
