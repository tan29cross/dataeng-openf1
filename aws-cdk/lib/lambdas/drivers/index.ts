import { SQSEvent, Context, SQSHandler, SQSRecord } from "aws-lambda"
import { Driver } from "../../types/driver"
import { getResponse, writeToS3, sendMessagesToSQS } from "../../global-helpers/index"
import { env } from "./env"

export const handler: SQSHandler = async (event: SQSEvent, context: Context) => {
  
  console.log(`Received event: ${JSON.stringify(event)}`)

  const sessionKeys:number[]  = event.Records.flatMap((record)=> JSON.parse(record.body))

  console.log(`Here are session keys: ${sessionKeys}`)


  const driversData = await getDrivers(sessionKeys)

  

   // Write data to S3
  // const bucketKey = `drivers/session-${meetingKey}-${formattedDate}.json`
  // await writeToS3(env.BUCKET_NAME, bucketKey, JSON.stringify(sessions))
  const sessions = Object.keys(driversData)
  await Promise.all(
    sessions.map(async (session) => {
      const bucketKey = `drivers/session=${session}/${context.awsRequestId}.json`
      const data = driversData[session]
      await writeToS3(env.BUCKET_NAME, bucketKey, JSON.stringify(data))
    })
    
  )

  
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