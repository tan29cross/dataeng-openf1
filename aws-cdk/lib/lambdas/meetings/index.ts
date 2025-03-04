import { APIGatewayProxyEvent, Context } from "aws-lambda"
import { writeToS3, getResponse, sendMessagesToSQS } from "../../global-helpers/index"
import { format } from 'date-fns'
import { env } from "./env"
import { Meeting } from "../../types/meeting"

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  
  const data = await getResponse(env.URL) as Meeting[]

  const meetingKeys = data.map(meeting => meeting.meeting_key)

  const currentDate = new Date()

  const formattedDate = format(currentDate, 'yyyy-MM-dd')

  const bucketKey = `meetings/meetings-${formattedDate}.json`
  
  // Write data to S3
  await writeToS3(env.BUCKET_NAME, bucketKey, JSON.stringify(data)) 

  // Send message to SQS
  await sendMessagesToSQS(env.QUEUE_URL, JSON.stringify({ meetingKeys }))
  
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  }
}