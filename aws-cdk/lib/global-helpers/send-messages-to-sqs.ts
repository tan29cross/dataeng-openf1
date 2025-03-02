import { SQS } from "aws-sdk"

export const sendMessagesToSQS = async (queueUrl: string, message: string) => {
  
  console.log(`Sending messages to SQS queue: ${queueUrl}`)
  
  const sqsClient = new SQS()
  
  await sqsClient.sendMessage({
      QueueUrl: queueUrl,
      MessageBody: message,
    }).promise()
  
  
  console.log(`Successfully sent messages to SQS queue: ${queueUrl}`)
  
}