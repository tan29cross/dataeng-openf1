import { SQSEvent, Context, SQSHandler, SQSRecord } from "aws-lambda"
import { Session } from "../../types/session"
import { getResponse, writeToS3, sendMessagesToSQS } from "../../global-helpers/index"
import { env } from "./env"


export const handler: SQSHandler = async (event: SQSEvent, context: Context) => {
  
  console.log(`Received event: ${JSON.stringify(event)}`)
  
  for (const record of event.Records) {
    console.log(`Processing record: ${JSON.stringify(record)}`)
    await getSessions(record)
  }
  
}

const getSessions = async (message: SQSRecord):Promise<Session[]> => {

    const meetingKeys: string[] = JSON.parse(message.body).meetingKeys

    let sessions: Session[] = []

    console.log(`Getting session data for meeting keys: ${meetingKeys}`)

    // Fetch sessions from meetings
    for (const meetingKey of meetingKeys) {


      const sessionUrl = `${env.URL}?meeting_key=${meetingKey}`

      console.log(`Fetching sessions for meeting: ${meetingKey}, with URL: ${sessionUrl}`)
      
      sessions = await getResponse(sessionUrl) as Session[]

      console.log(`Here are the sessions for meeting: ${meetingKey}: ${JSON.stringify(sessions)}`)

      // Write data to S3
      const currentDate = new Date()
      const formattedDate = currentDate.toISOString().split('T')[0]
      const bucketKey = `sessions/session-${meetingKey}-${formattedDate}.json`
      await writeToS3(env.BUCKET_NAME, bucketKey, JSON.stringify(sessions))
      

      // Send sessions to Sessions SQS.
      await sendMessagesToSQS(env.QUEUE_URL, JSON.stringify(sessions.map((session: Session) => session.session_key)))
      
    }

    return sessions
}