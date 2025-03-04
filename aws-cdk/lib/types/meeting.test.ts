import { meetingSchema } from "./meeting"
import { describe, expect, it } from "vitest"

const meetingFixture = {
    circuit_key: 61,
    circuit_short_name: "Singapore",
    country_code: "SGP",
    country_key: 157,
    country_name: "Singapore",
    date_start: "2023-09-15T09:30:00+00:00",
    gmt_offset: "08:00:00",
    location: "Marina Bay",
    meeting_key: 1219,
    meeting_name: "Singapore Grand Prix",
    meeting_official_name: "FORMULA 1 SINGAPORE AIRLINES SINGAPORE GRAND PRIX 2023",
}

describe("parse meeting schema", () => {
    const meeting = {
        ...meetingFixture,
        year: 2023,
      }
  it("parses valid schema", () => {
    expect(meetingSchema.parse(meeting)).toEqual(
      expect.objectContaining(meeting),
    )
  })

  it("throws error when all required fileds not in the schema", () => {
    const meeting = {
      ...meetingFixture,
    }
    const result = meetingSchema.safeParse(meeting)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Required")
    }
  })

})
