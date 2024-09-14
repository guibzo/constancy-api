import { getWeekPendingGoalsUseCase } from '@/use-cases/get-week-pending-goals';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/pending-goals',
    async (request, reply) => {
      const { pendingGoals } = await getWeekPendingGoalsUseCase()
  
      reply.send({ pendingGoals })
    }
  )
};
