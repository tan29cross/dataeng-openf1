import { driverSchema } from './driver'

const drvierFxirtures =   {
    broadcast_name: "M VERSTAPPEN",
    country_code: "NED",
    driver_number: 1,
    first_name: "Max",
    full_name: "Max VERSTAPPEN",
    headshot_url: "https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png",
    last_name: "Verstappen",
    meeting_key: 1219,
    name_acronym: "VER",
    session_key: 9158,
    team_colour: "3671C6",
  }

describe("parse driver schema", () => {
   
  it("parses valid schema", () => {
     const driver = {
        ...drvierFxirtures,
        team_name: "Red Bull Racing Honda"
      }
    expect(driverSchema.parse(driver)).toEqual(
      expect.objectContaining(driver),
    )
  })

  it("throws error when all required fileds not in the schema", () => {
    const driver = {
      ...drvierFxirtures,
    }
    const result = driverSchema.safeParse(driver)
    console.log(result)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Required")
    }
  })
})  
