import { sessionSchema } from "./session"
import { describe, expect, it } from "vitest"

const sessionFixture = {
    circuit_key: 7,
    circuit_short_name: "Spa-Francorchamps",
    country_code: "BEL",
    country_key: 16,
    country_name: "Belgium",
    date_end: "2023-07-29T15:35:00+00:00",
    date_start: "2023-07-29T15:05:00+00:00",
    gmt_offset: "02:00:00",
    location: "Spa-Francorchamps",
    meeting_key: 1216,
    session_key: 9140,
    session_name: "Sprint",
    session_type: "Race",
}

describe("parse session schema", () => {
    const session = {
        ...sessionFixture,
        year: 2023,
      }
  it("parses valid schema", () => {
    expect(sessionSchema.parse(session)).toEqual(
      expect.objectContaining(session),
    )
  })

  it("throws error when all required fileds not in the schema", () => {
    const result = sessionSchema.safeParse(sessionFixture)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Required")
    }
  })

})
