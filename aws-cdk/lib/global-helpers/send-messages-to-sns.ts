import { SNS } from 'aws-sdk'

export const sendMessagesToSNS = async (topicArn: string, message: string) => {
  console.log(`Sending messages to SNS topic: ${topicArn}`)

  const snsClient = new SNS()

  await snsClient.publish({
    TopicArn: topicArn,
    Message: message,
  }).promise()

  console.log(`Successfully sent messages to SNS topic: ${topicArn}`)
}