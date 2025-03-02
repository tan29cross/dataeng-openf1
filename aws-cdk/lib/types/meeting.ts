import { z } from "zod"
import { dateStringSchema } from "./common"

export const meetingSchema = z.object({
    circuit_key: z.number(),
    circuit_short_name: z.string(),
    country_code: z.string(),
    country_key: z.number(),
    country_name: z.string(),
    date_start: dateStringSchema,
    gmt_offset: z.string(),
    location: z.string(),
    meeting_key: z.number(),
    meeting_name: z.string(),
    meeting_official_name: z.string(),
    year: z.number(),
})

export type Meeting = z.infer<typeof meetingSchema>
