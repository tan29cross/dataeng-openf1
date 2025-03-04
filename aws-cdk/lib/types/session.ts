import { z } from "zod"

import { dateStringSchema } from "./common"

export const sessionSchema = z.object({
    circuit_key: z.number(),
    circuit_short_name: z.string(),
    country_code: z.string(),
    country_key: z.number(),
    country_name: z.string(),
    date_end: dateStringSchema,
    date_start: dateStringSchema,
    gmt_offset: z.string(),
    location: z.string(),
    meeting_key: z.number(),
    session_key: z.number(),
    session_name: z.string(),
    session_type: z.string(),
    year: z.number(),

})  

export type Session = z.infer<typeof sessionSchema>