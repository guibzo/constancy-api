import { createGoalUseCase } from '@/use-cases/goals/create-goal/use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticateUserMiddleware } from '../../../middlewares/authenticate-user'

export const createGoalRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/goals',
    {
      onRequest: [authenticateUserMiddleware],
      schema: {
        description: 'Create a goal',
        tags: ['goals'],
        body: z.object({
          title: z.string(),
          desiredWeeklyFrequency: z.number().int().min(1).max(7),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { title, desiredWeeklyFrequency } = request.body
      const userId = request.user.sub

      await createGoalUseCase({ title, desiredWeeklyFrequency, userId })

      reply.status(201).send()
    }
  )
}
