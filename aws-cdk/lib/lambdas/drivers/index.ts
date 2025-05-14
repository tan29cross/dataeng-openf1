import { SQSEvent, Context, SQSHandler, SQSRecord } from "aws-lambda"
import { Driver } from "../../types/driver"
import { getResponse, writeToS3, sendMessagesToSNS } from "../../global-helpers/index"
import { env } from "./env"

export const handler: SQSHandler = async (event: SQSEvent, context: Context) => {
  
  console.log(`Received event: ${JSON.stringify(event)}`)

  const sessionKeys:number[]  = event.Records.flatMap((record)=> JSON.parse(record.body))

  console.log(`Here are session keys: ${sessionKeys}`)


  const driversData = await getDrivers(sessionKeys)

  console.log(`Here are the drivers data: ${JSON.stringify(driversData)}`)

   // Write data to S3
  const sessions = Object.keys(driversData)
  await Promise.all(
    sessions.map(async (session) => {
      const bucketKey = `drivers/session=${session}/${context.awsRequestId}.json`
      const data = driversData[session]
      await writeToS3(env.BUCKET_NAME, bucketKey, JSON.stringify(data))
    })

  )

  // Cretate a list of seesion keys and driver keys
  const sessionDrivers = sessions.reduce((acc, session) => {
    const drivers = driversData[session].map((driver) => driver.driver_number)
    acc.push({ session, drivers })
    return acc
  }, [] as { session: string; drivers: number[] }[])

  console.log(`Here are the session drivers: ${JSON.stringify(sessionDrivers)}`)

  // Send message to SNS
  await sendMessagesToSNS(env.TOPIC_ARN, JSON.stringify(sessionDrivers))

}

const getDrivers = async (sessions: number[]) => {

  let sessionsData: Record<string, Driver[]> = {}

  const responses = await Promise.all(
    sessions.map( async (session) => {
      console.log(`Fetching drivers data for session: ${session}`)
      const url = env.URL + "?" + `session_key=${session}`
      const results:Driver[] = await getResponse(url)
      return { session , results }

    })
  )

  console.log(`Here is the reponse: ${responses}`)

    for (const { session, results } of responses) {
    sessionsData[session] = results.reduce((acc, record) => {
      acc.push(record)
      return acc
    }, [] as Driver[])

  }

  return sessionsData
  
}