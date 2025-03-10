import { z } from "zod"
import { driverSchema, Driver } from "../../types/driver"

// export const sessionDrivers = z.object({
//     session_key: z.object({
//         driver_number: z.array(driverSchema)
//     })

// })

export const sessionDrivers = z.record(z.number(), z.record(z.number(), driverSchema))


// export type SessionDrivers = z.infer<typeof sessionDrivers>
export type SessionDrivers = Record<number, Record<number, Driver[]>>