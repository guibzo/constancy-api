import { getWeekSummaryUseCase } from '@/use-cases/get-week-summary-use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async (app) => {
  app.get('/week-summary', async (request, reply) => {
    const { summary } = await getWeekSummaryUseCase()

    reply.send({ summary })
  })
}
