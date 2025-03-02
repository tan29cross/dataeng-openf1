import { S3 } from 'aws-sdk'

export async function writeToS3(bucketName: string, key: string, data: string): Promise<void> {
  
  console.log(`Writing to S3 bucket: ${bucketName}, key: ${key}`)

  const s3Client = new S3()

  await s3Client.putObject({
    Bucket: bucketName,
    Key: key,
    Body: data,
  }).promise()

  console.log(`Successfully written to S3 bucket: ${bucketName}, key: ${key}`)

}