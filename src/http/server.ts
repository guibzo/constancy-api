import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { createGoalConclusionRoute } from './routes/create-goal-conclusion-route'
import { createGoalRoute } from './routes/create-goal-route'
import { getPendingGoalsRoute } from './routes/get-pending-goals-route'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createGoalRoute)
app.register(createGoalConclusionRoute)
app.register(getPendingGoalsRoute)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log(`🚀 Server listening on port ${3333}!`)
  })
