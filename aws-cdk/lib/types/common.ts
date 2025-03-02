import { z } from "zod"

export const dateStringSchema = z.string().refine((v) => !isNaN(Date.parse(v)))
export type DateString = z.infer<typeof dateStringSchema>
