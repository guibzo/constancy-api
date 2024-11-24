import { env } from '@/env'
import { fastifyCors } from '@fastify/cors'
import { fastifyJwt } from '@fastify/jwt'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { getUserRoute } from './routes/account/get-user-route'
import { authenticateWithGitHubRoute } from './routes/auth/authenticate-with-github'
import { createGoalConclusionRoute } from './routes/goals/create-goal-conclusion-route'
import { createGoalRoute } from './routes/goals/create-goal-route'
import { getWeekPendingGoalsRoute } from './routes/goals/get-week-pending-goals-route'
import { getWeekSummaryRoute } from './routes/goals/get-week-summary-route'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Constancy API',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(createGoalRoute)
app.register(createGoalConclusionRoute)
app.register(getWeekPendingGoalsRoute)

app.register(authenticateWithGitHubRoute)

app.register(getWeekSummaryRoute)
app.register(getUserRoute)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log(`🚀 Server listening on port ${3333}!`)
  })
