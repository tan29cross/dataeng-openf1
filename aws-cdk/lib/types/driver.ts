import { z } from 'zod'

export const driverSchema = z.object({
  broadcast_name: z.string(),
  country_code: z.string(),
  driver_number: z.number(),
  first_name: z.string(),
  full_name: z.string(),
  headshot_url: z.string(),
  last_name: z.string(),
  meeting_key: z.number(),
  name_acronym: z.string(),
  session_key: z.number(),
  team_colour: z.string(),
  team_name: z.string()
})

export type Driver = z.infer<typeof driverSchema>
  