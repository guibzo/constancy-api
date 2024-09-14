import fastifyCors from '@fastify/cors'
import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
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

app.register(createGoalRoute)
app.register(createGoalConclusionRoute)
app.register(getWeekPendingGoalsRoute)
app.register(getWeekSummaryRoute)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log(`🚀 Server listening on port ${3333}!`)
  })
