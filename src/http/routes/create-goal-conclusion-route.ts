import { createGoalConclusionUseCase } from '@/use-cases/create-goal-conclusion';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

export const createGoalConclusionRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/goal-conclusions',
    {
      schema: {
        body: z.object({
          goalId: z.string()
        }),
      },
    },
    async (request, reply) => {
      const { goalId } = request.body
  
      await createGoalConclusionUseCase({ goalId })
  
      reply.status(201).send()
    }
  )
};
