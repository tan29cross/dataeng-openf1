import { z } from 'zod'

export const envSchema = z.object({
    BUCKET_NAME: z.string(),
    TOPIC_ARN: z.string(),
    URL: z.string(),
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)