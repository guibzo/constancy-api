import { getWeekSummaryUseCase } from '@/use-cases/get-week-summary-use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/week-summary',
    {
      schema: {
        description: 'Get week summmary',
        tags: ['summary'],
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
      const { summary } = await getWeekSummaryUseCase()

      reply.send({ summary })
    }
  )
}
