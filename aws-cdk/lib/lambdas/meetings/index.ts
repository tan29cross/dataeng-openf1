import { APIGatewayProxyEvent, Context } from "aws-lambda"
import { writeToS3, getResponse, sendMessagesToSQS } from "../../global-helpers/index"
import { format } from 'date-fns'
import { env } from "./env"

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  
  const data = await getResponse(env.URL)
  const currentDate = new Date()
  const formattedDate = format(currentDate, 'yyyy-MM-dd')

  const bucketKey = `meeting/meetings-${formattedDate}.json`
  
  // Write data to S3
  await writeToS3(env.BUCKET_NAME, bucketKey, JSON.stringify(data)) 

  // Send message to SQS
  await sendMessagesToSQS(env.QUEUE_URL, JSON.stringify({ bucketName: env.BUCKET_NAME, key: bucketKey }))
  
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  }
}