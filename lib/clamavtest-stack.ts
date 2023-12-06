
import { SqsDestination, LambdaDestination } from 'aws-cdk-lib/aws-lambda-destinations';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { SnsTopic } from 'aws-cdk-lib/aws-events-targets';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { ServerlessClamscan } from 'cdk-serverless-clamscan';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { RuleTargetInput } from 'aws-cdk-lib/aws-events';

export class ClamavtestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Implement antivirus capability in preexisting antivirus
    const BackEndBucket = Bucket.fromBucketName(
      this,
      `mybucket`,
      `gamonavclamdest`,
    );
    
    //Creates a new lambda which points to lambda/index.mjs
    const clamScanDeleteLambda = new Function(this, 'clamscan-delete-file', {
      runtime: Runtime.NODEJS_20_X,  
      code: Code.fromAsset('lambda'),  
      handler: 'index.handler',  
    });

    //initializes a ServerlessClamscan instance in an AWS environment
    const sc = new ServerlessClamscan(this, 'Clamscan', {
      acceptResponsibilityForUsingImportedBucket: true,
      onResult: new LambdaDestination(clamScanDeleteLambda),
      scanFunctionMemorySize: 2048
    });
    sc.addSourceBucket(BackEndBucket);
    
    //Amazon SNS topic which associates it as a target for the infectedRule of a ServerlessClamscan instance
    const infectedTopic = new Topic(this, 'rInfectedTopic');
    sc.infectedRule?.addTarget(
      new SnsTopic(infectedTopic, {
        message: RuleTargetInput.fromEventPath(
          '$.detail.responsePayload.message',
        ),
      }),
    );
  }
}
