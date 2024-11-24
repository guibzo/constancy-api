import { authenticateFromGitHubCodeUseCase } from '@/use-cases/auth/authenticate-from-github-code/use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const authenticateWithGitHubRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/auth/github',
    {
      schema: {
        description: 'Authenticate user from GitHub code',
        tags: ['auth'],
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const { token } = await authenticateFromGitHubCodeUseCase({ code })

      reply.status(201).send({ token })
    }
  )
}
