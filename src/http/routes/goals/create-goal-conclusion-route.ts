import { createGoalConclusionUseCase } from '@/use-cases/goals/create-goal-conclusion-use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticateUserMiddleware } from '../../middlewares/authenticate-user'

export const createGoalConclusionRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/goal-conclusions',
    {
      onRequest: [authenticateUserMiddleware],
      schema: {
        description: 'Conclude a goal',
        tags: ['goals'],
        body: z.object({
          goalId: z.string(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { goalId } = request.body
      const userId = request.user.sub

      await createGoalConclusionUseCase({ goalId, userId })

      reply.status(201).send()
    }
  )
}
