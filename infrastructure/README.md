# CanvasAI Infrastructure

AWS CDK infrastructure for CanvasAI, written in TypeScript.

## Architecture

The infrastructure is organized into separate stacks:

- **DatabaseStack**: DynamoDB tables for projects and analytics
- **StorageStack**: S3 bucket and CloudFront distribution for images
- **AuthStack**: Cognito User Pool for authentication
- **ApiStack**: API Gateway and Lambda functions

## Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with credentials
- AWS CDK CLI: `npm install -g aws-cdk`

## Setup

```bash
cd infrastructure
npm install
```

## Configuration

Set environment variables:

```bash
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=us-east-1
export ENVIRONMENT=dev
```

## CDK Commands

### Synthesize CloudFormation Templates

```bash
npm run synth
```

### View Changes (Diff)

```bash
npm run diff
```

### Deploy All Stacks

```bash
npm run deploy
```

### Deploy Specific Stack

```bash
npx cdk deploy CanvasAI-Database-dev
```

### Destroy All Stacks

```bash
npm run destroy
```

## Stack Details

### DatabaseStack

Creates two DynamoDB tables:

**Projects Table:**
- PK: `projectId`
- SK: `versionId`
- GSI: `UserProjectsIndex` (userId, timestamp)

**Analytics Table:**
- PK: `analyticsId`
- SK: `timestamp`

### StorageStack

- S3 bucket with versioning enabled
- Lifecycle policy: Archive to Glacier after 30 days
- CloudFront CDN for fast image delivery
- CORS configuration for frontend access

### AuthStack

- Cognito User Pool with email sign-in
- Password requirements: 8+ chars, uppercase, lowercase, number, symbol
- OAuth flows for web client

### ApiStack

API Gateway with Lambda integrations:

**Endpoints:**
- `POST /generate` - Generate initial design
- `POST /refine` - Refine existing design
- `GET /projects` - Get user's projects

All endpoints require Cognito authentication.

## Deployment Order

Stacks are deployed in this order due to dependencies:
1. DatabaseStack
2. StorageStack
3. AuthStack
4. ApiStack (depends on all above)

## Bootstrap (First Time Only)

Before deploying for the first time:

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

## Outputs

After deployment, stack outputs include:

- API URL
- User Pool ID and Client ID
- S3 Bucket name
- CloudFront distribution domain
- DynamoDB table names

Update your `.env.development` file with these values.

## Cost Estimation

### Development Environment:
- DynamoDB: On-demand pricing (~$2/month for low usage)
- S3: $0.023 per GB + transfer costs (~$5/month)
- Lambda: Free tier covers development usage
- API Gateway: $3.50 per million requests
- Cognito: Free for < 50K MAU
- **Estimated Total**: ~$15-20/month

## Useful CDK Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `npm test` - Run unit tests
- `cdk ls` - List all stacks
- `cdk doctor` - Check CDK setup

## Security Notes

- All stacks use least-privilege IAM policies
- Cognito enforces strong password requirements
- API Gateway has rate limiting enabled (100 req/s)
- S3 bucket has encryption at rest
- CORS is configured but should be restricted to frontend domain

## Next Steps

1. Deploy infrastructure: `npm run deploy`
2. Note the output values (API URL, User Pool IDs, etc.)
3. Update frontend `.env` file with CDK outputs
4. Implement Lambda function logic (Phase 3)
5. Add Secrets Manager for OpenAI API key
