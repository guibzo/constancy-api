import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { authenticateWithGitHubRoute } from './routes/authenticate-with-github'
import { createGoalConclusionRoute } from './routes/create-goal-conclusion-route'
import { createGoalRoute } from './routes/create-goal-route'
import { getWeekPendingGoalsRoute } from './routes/get-week-pending-goals-route'
import { getWeekSummaryRoute } from './routes/get-week-summary-route'

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

app.register(createGoalRoute)
app.register(createGoalConclusionRoute)
app.register(getWeekPendingGoalsRoute)
app.register(getWeekSummaryRoute)
app.register(authenticateWithGitHubRoute)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log(`🚀 Server listening on port ${3333}!`)
  })
