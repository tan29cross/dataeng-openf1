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

    const meetingsQueue = new Queue(this, 'MeetingQueue', {
      visibilityTimeout: Duration.seconds(300),})
    
    // Meeting Lambda function
    const processMeetings = new NodejsFunction(this, 'Meetings', {
      entry: path.join(__dirname, '../lambdas/meetings/index.ts'), // Path to the Lambda function
      handler: 'handler', 
      environment: {
        BUCKET_NAME: ingestionBucket.bucketName,
        QUEUE_URL: meetingsQueue.queueUrl,
        URL: 'https://api.openf1.org/v1/meetings?year=2024',
      },
      timeout: Duration.seconds(300),
    })
    
    ingestionBucket.grantReadWrite(processMeetings)
    meetingsQueue.grantSendMessages(processMeetings)

    // Session Lambda function
    
    const sessionsQueue = new Queue(this, 'SessionsQueue', {
      visibilityTimeout: Duration.minutes(300)
    })

    const processSessions = new NodejsFunction(this, 'Sessions', {
      entry: path.join(__dirname, '../lambdas/sessions/index.ts'), // Path to the Lambda function
      handler: 'handler', 
      environment: {
        BUCKET_NAME: ingestionBucket.bucketName,
        QUEUE_URL: sessionsQueue.queueUrl,
        URL: 'https://api.openf1.org/v1/sessions'
      },
      timeout: Duration.seconds(300),
    })
    ingestionBucket.grantReadWrite(processSessions)
    meetingsQueue.grantConsumeMessages(processSessions)
    sessionsQueue.grantSendMessages(processSessions)
    processSessions.addEventSourceMapping('MeetingsQueueEventSource', {
      eventSourceArn: meetingsQueue.queueArn,
    })

    // Drivers Queue 
    const driversQueue = new Queue(this, "DriversQueue", {
      visibilityTimeout: Duration.minutes(300)
    })

    // Drivers Lambda function 
    const processDrivers = new NodejsFunction(this, "Drivers", {
      entry: path.join(__dirname, '../lambdas/drivers/index.ts'), // Path to the Lambda function
      handler: "handler",
      environment: {
        BUCKET_NAME: ingestionBucket.bucketName,
        QUEUE_URL: driversQueue.queueUrl,
        URL: 'https://api.openf1.org/v1/drivers'
      },
      timeout: Duration.seconds(300)
    })

    // Permissions & event source mapping for reading messages from the Sessions queue. 

    sessionsQueue.grantConsumeMessages(processDrivers)
    processDrivers.addEventSourceMapping('DriversQueueEventSource', {
      eventSourceArn: sessionsQueue.queueArn
    })

    // Bucket permissions
    ingestionBucket.grantReadWrite(processDrivers)

    // Send messages to the drivers queue 
    driversQueue.grantSendMessages(processDrivers)

  
  }
}
