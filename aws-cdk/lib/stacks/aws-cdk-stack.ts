import { Stack, RemovalPolicy, StackProps, Duration }from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Queue } from 'aws-cdk-lib/aws-sqs'

import path = require('path')

export class AwsCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Ingestion bucket
    const ingestionBucket = new Bucket(this, 'IngestionBucket', {
      removalPolicy: RemovalPolicy.RETAIN,
    })

    const meetingQueue = new Queue(this, 'MeetingQueue')
    
    // Meeting Lambda function
    const processMeetings = new NodejsFunction(this, 'Meetings', {
      entry: path.join(__dirname, '../lambdas/meetings/index.ts'), // Path to the Lambda function
      handler: 'handler', 
      environment: {
        BUCKET_NAME: ingestionBucket.bucketName,
        QUEUE_URL: meetingQueue.queueUrl,
        URL: 'https://api.openf1.org/v1/meetings?year=2024',
      },
      timeout: Duration.seconds(300),
    })
    
    ingestionBucket.grantReadWrite(processMeetings)
    meetingQueue.grantSendMessages(processMeetings)
    
  }
}
