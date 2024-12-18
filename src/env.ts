import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).optional().default('production'),
  DATABASE_URL: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  JWT_SECRET: z.string(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (parsedEnv.success === false) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format())

  throw new Error('❌ Invalid environment variables!')
}

export const env = envSchema.parse(process.env)
