#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { StorageStack } from '../lib/storage-stack';
import { AuthStack } from '../lib/auth-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

const environment = process.env.ENVIRONMENT || 'dev';

// Database Stack - DynamoDB tables
const databaseStack = new DatabaseStack(app, `CanvasAI-Database-${environment}`, {
  env,
  environment,
  description: 'CanvasAI DynamoDB tables for projects and analytics',
});

// Storage Stack - S3 + CloudFront
const storageStack = new StorageStack(app, `CanvasAI-Storage-${environment}`, {
  env,
  environment,
  description: 'CanvasAI S3 bucket and CloudFront distribution for images',
});

// Auth Stack - Cognito
const authStack = new AuthStack(app, `CanvasAI-Auth-${environment}`, {
  env,
  environment,
  description: 'CanvasAI Cognito User Pool for authentication',
});

// API Stack - API Gateway + Lambda functions
const apiStack = new ApiStack(app, `CanvasAI-Api-${environment}`, {
  env,
  environment,
  projectsTable: databaseStack.projectsTable,
  analyticsTable: databaseStack.analyticsTable,
  imagesBucket: storageStack.imagesBucket,
  userPool: authStack.userPool,
  description: 'CanvasAI API Gateway and Lambda functions',
});

// Add dependencies
apiStack.addDependency(databaseStack);
apiStack.addDependency(storageStack);
apiStack.addDependency(authStack);

// Tags for all resources
cdk.Tags.of(app).add('Project', 'CanvasAI');
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'CDK');

app.synth();
