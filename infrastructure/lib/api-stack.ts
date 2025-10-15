import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as path from 'path';

export interface ApiStackProps extends cdk.StackProps {
  environment: string;
  projectsTable: dynamodb.Table;
  analyticsTable: dynamodb.Table;
  imagesBucket: s3.Bucket;
  userPool: cognito.UserPool;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // API Gateway REST API
    this.api = new apigateway.RestApi(this, 'CanvasAIApi', {
      restApiName: `CanvasAI-API-${props.environment}`,
      description: 'CanvasAI API for design generation',
      deployOptions: {
        stageName: props.environment,
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // TODO: Restrict to frontend
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [props.userPool],
    });

    // Common Lambda environment variables
    const lambdaEnvironment = {
      DYNAMODB_PROJECTS_TABLE: props.projectsTable.tableName,
      DYNAMODB_ANALYTICS_TABLE: props.analyticsTable.tableName,
      S3_IMAGES_BUCKET: props.imagesBucket.bucketName,
      // OPENAI_API_KEY will be set via Secrets Manager in Phase 3
    };

    // Lambda: Generate Design
    const generateDesignFn = new lambda.Function(this, 'GenerateDesignFunction', {
      functionName: `CanvasAI-GenerateDesign-${props.environment}`,
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'generate_design.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambdas')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(60),
      memorySize: 1024,
    });

    // Lambda: Refine Design
    const refineDesignFn = new lambda.Function(this, 'RefineDesignFunction', {
      functionName: `CanvasAI-RefineDesign-${props.environment}`,
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'refine_design.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambdas')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(60),
      memorySize: 1024,
    });

    // Lambda: Get Projects
    const getProjectsFn = new lambda.Function(this, 'GetProjectsFunction', {
      functionName: `CanvasAI-GetProjects-${props.environment}`,
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'get_projects.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambdas')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    // Grant permissions
    props.projectsTable.grantReadWriteData(generateDesignFn);
    props.projectsTable.grantReadWriteData(refineDesignFn);
    props.projectsTable.grantReadData(getProjectsFn);
    props.analyticsTable.grantWriteData(generateDesignFn);
    props.analyticsTable.grantWriteData(refineDesignFn);
    props.imagesBucket.grantReadWrite(generateDesignFn);
    props.imagesBucket.grantReadWrite(refineDesignFn);

    // API Routes
    const generateResource = this.api.root.addResource('generate');
    generateResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(generateDesignFn),
      { authorizer }
    );

    const refineResource = this.api.root.addResource('refine');
    refineResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(refineDesignFn),
      { authorizer }
    );

    const projectsResource = this.api.root.addResource('projects');
    projectsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProjectsFn),
      { authorizer }
    );

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
    });
  }
}
