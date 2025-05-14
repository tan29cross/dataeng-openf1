import { Stack, RemovalPolicy, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import path from 'path'

export class AwsCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Ingestion bucket
    const ingestionBucket = new Bucket(this, 'IngestionBucket', {
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Meetings Queue
    const meetingsQueue = new Queue(this, 'MeetingQueue', {
      visibilityTimeout: Duration.seconds(300),
    });

    // Meeting Lambda function
    const processMeetings = new NodejsFunction(this, 'Meetings', {
      entry: path.join(__dirname, '../lambdas/meetings/index.ts'),
      handler: 'handler',
      environment: {
        BUCKET_NAME: ingestionBucket.bucketName,
        QUEUE_URL: meetingsQueue.queueUrl,
        URL: 'https://api.openf1.org/v1/meetings?year=2024',
      },
      timeout: Duration.seconds(300),
    });

    ingestionBucket.grantReadWrite(processMeetings)
    meetingsQueue.grantSendMessages(processMeetings)

    // Sessions Queue
    const sessionsQueue = new Queue(this, 'SessionsQueue', {
      visibilityTimeout: Duration.minutes(300),
    });

    // Session Lambda function
    const processSessions = new NodejsFunction(this, 'Sessions', {
      entry: path.join(__dirname, '../lambdas/sessions/index.ts'),
      handler: 'handler',
      environment: {
        BUCKET_NAME: ingestionBucket.bucketName,
        QUEUE_URL: sessionsQueue.queueUrl,
        URL: 'https://api.openf1.org/v1/sessions',
      },
      timeout: Duration.seconds(300),
    });

    ingestionBucket.grantReadWrite(processSessions);
    meetingsQueue.grantConsumeMessages(processSessions);
    sessionsQueue.grantSendMessages(processSessions);

    processSessions.addEventSourceMapping('MeetingsQueueEventSource', {
      eventSourceArn: meetingsQueue.queueArn,
    });

    // SNS Topic for sessions & drivers notifications
    const sessionsDriversTopic = new Topic(this, 'SessionsDriversTopic', {
      displayName: 'Sessions Topic',
    });

    // Drivers Lambda function
    const processDrivers = new NodejsFunction(this, 'Drivers', {
      entry: path.join(__dirname, '../lambdas/drivers/index.ts'),
      handler: 'handler',
      environment: {
        BUCKET_NAME: ingestionBucket.bucketName,
        TOPIC_ARN: sessionsDriversTopic.topicArn,
        URL: 'https://api.openf1.org/v1/drivers',
      },
      timeout: Duration.seconds(300),
    });

    // Permissions & event source mapping for reading messages from the Sessions queue
    sessionsQueue.grantConsumeMessages(processDrivers);
    processDrivers.addEventSourceMapping('DriversQueueEventSource', {
      eventSourceArn: sessionsQueue.queueArn,
    });

    // Bucket permissions
    ingestionBucket.grantReadWrite(processDrivers);

    // Grant the Lambda function permissions to publish to the SNS topic
    sessionsDriversTopic.grantPublish(processDrivers);
  }
}
