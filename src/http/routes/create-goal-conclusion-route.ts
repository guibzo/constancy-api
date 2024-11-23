import { createGoalConclusionUseCase } from '@/use-cases/create-goal-conclusion-use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticateUserMiddleware } from '../middlewares/authenticate-user'

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

      await createGoalConclusionUseCase({ goalId })

      reply.status(201).send()
    }
  )
}
