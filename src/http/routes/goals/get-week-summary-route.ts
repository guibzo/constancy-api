import { getWeekSummaryUseCase } from '@/use-cases/goals/get-week-summary-use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { authenticateUserMiddleware } from '../../middlewares/authenticate-user'

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/week-summary',
    {
      onRequest: [authenticateUserMiddleware],
      schema: {
        description: 'Get week summmary',
        tags: ['goals'],
        response: {
          200: z.object({
            summary: z.array(
              z.object({
                completed: z.number(),
                total: z.number(),
                goalsPerDay: z.record(
                  z.string(),
                  z.array(
                    z.object({
                      completedAt: z.string(),
                      id: z.string(),
                      title: z.string(),
                    })
                  )
                ),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.sub
      const { summary } = await getWeekSummaryUseCase({ userId })

      reply.send({ summary })
    }
  )
}
