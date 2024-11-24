import { getUserUseCase } from '@/use-cases/account/get-user/use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticateUserMiddleware } from '../../../middlewares/authenticate-user'

export const getUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/profile',
    {
      onRequest: [authenticateUserMiddleware],
      schema: {
        description: 'Get authenticated user profile data',
        tags: ['account'],
        response: {
          200: z.object({
            user: z.object({
              id: z.string(),
              name: z.string().nullable(),
              email: z.string().nullable(),
              avatarURL: z.string().url(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.sub

      const { user } = await getUserUseCase({ userId })

      reply.send({ user })
    }
  )
}
