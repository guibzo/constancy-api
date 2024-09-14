import { createGoalUseCase } from '@/use-cases/create-goal-use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const createGoalRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/goals',
    {
      schema: {
        body: z.object({
          title: z.string(),
          desiredWeeklyFrequency: z.number().int().min(1).max(7),
        }),
      },
    },
    async (request, reply) => {
      const { title, desiredWeeklyFrequency } = request.body

      const { goal } = await createGoalUseCase({ title, desiredWeeklyFrequency })

      reply.status(201).send({ goal })
    }
  )
}
