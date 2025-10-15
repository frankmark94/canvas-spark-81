# CanvasAI Architecture

This document describes the system architecture for CanvasAI.

## System Overview

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│  ┌───────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐│
│  │ InputPanel│  │ CanvasArea│ │ Dashboard  │  │ Auth UI  ││
│  └───────────┘  └──────────┘  └────────────┘  └──────────┘│
│                    AWS Amplify (Auth)                        │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  AWS API Gateway (REST)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cognito Authorizer (validates JWT tokens)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Routes:                                                     │
│  • POST /generate   → GenerateDesignLambda                  │
│  • POST /refine     → RefineDesignLambda                    │
│  • GET  /projects   → GetProjectsLambda                     │
└───────────────────────────┬──────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
           ↓                ↓                ↓
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Lambda 1 │    │ Lambda 2 │    │ Lambda 3 │
    │ Generate │    │  Refine  │    │   Get    │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         └───────┬───────┴───────┬───────┘
                 │               │
      ┌──────────┤               ├──────────┐
      │          │               │          │
      ↓          ↓               ↓          ↓
┌──────────┐ ┌─────────┐   ┌─────────┐ ┌────────────┐
│ OpenAI   │ │ DynamoDB│   │   S3    │ │ CloudFront │
│ GPT-4 +  │ │ Projects│   │ Images  │ │    CDN     │
│ DALL-E 3 │ │Analytics│   │         │ │            │
└──────────┘ └─────────┘   └─────────┘ └────────────┘
```

## Components

### Frontend Layer

**Technology**: React 18 + TypeScript + Vite

**Key Components**:
- `InputPanel`: User story and acceptance criteria input
- `CanvasArea`: Display generated mockups
- `ExamplePrompts`: Pre-built templates
- `Header`: Navigation and branding
- `Dashboard`: Project list and management

**State Management**:
- React Query for server state (caching, invalidation)
- React Context for auth state
- Local state for UI interactions

**Authentication**:
- AWS Amplify handles Cognito integration
- JWT tokens sent with each API request
- Automatic token refresh

### API Gateway Layer

**Type**: REST API

**Features**:
- Cognito User Pools Authorizer
- CORS enabled for frontend domain
- Rate limiting (100 req/s, burst 200)
- Request/response logging to CloudWatch

**Routes**:

| Method | Path       | Lambda Function    | Description                |
|--------|------------|--------------------|----------------------------|
| POST   | /generate  | GenerateDesign     | Create initial design      |
| POST   | /refine    | RefineDesign       | Refine existing design     |
| GET    | /projects  | GetProjects        | List user's projects       |

### Lambda Functions Layer

**Runtime**: Python 3.11

**Shared Dependencies** (`backend/shared/`):
- `openai_client.py`: OpenAI API wrapper
- `dynamodb_client.py`: DynamoDB operations
- `s3_client.py`: S3 image storage
- `prompt_builder.py`: Prompt templates

#### GenerateDesignLambda

**Purpose**: Generate initial design from user story

**Flow**:
1. Validate request (userId, userStory, acceptanceCriteria)
2. Call GPT-4 to extract UI intents
3. Build structured prompt for DALL-E
4. Generate image with DALL-E 3
5. Download image from OpenAI URL
6. Upload image to S3
7. Save project metadata to DynamoDB
8. Record analytics event
9. Return projectId, versionId, imageUrl

**Memory**: 1024 MB
**Timeout**: 60 seconds

#### RefineDesignLambda

**Purpose**: Refine existing design with user feedback

**Flow**:
1. Load existing project and latest version
2. Build refinement prompt incorporating notes
3. Generate new image with DALL-E
4. Upload to S3
5. Save new version to DynamoDB (increment versionId)
6. Record analytics
7. Return new version data

**Memory**: 1024 MB
**Timeout**: 60 seconds

#### GetProjectsLambda

**Purpose**: Retrieve user's projects with pagination

**Flow**:
1. Query DynamoDB UserProjectsIndex by userId
2. Paginate results (20 per page)
3. Return list with thumbnails and metadata

**Memory**: 512 MB
**Timeout**: 30 seconds

### Data Layer

#### DynamoDB

**Projects Table**:
```
Partition Key: projectId (String)
Sort Key: versionId (String)

Attributes:
- userId (String)
- userStory (String)
- acceptanceCriteria (String)
- imageUrl (String)
- imageKey (String)
- timestamp (String - ISO 8601)
- refinementNotes (String)
- modelUsed (String)
- generationTime (Number)
- prompt (String)

GSI: UserProjectsIndex
  PK: userId
  SK: timestamp
```

**Analytics Table**:
```
Partition Key: analyticsId (String)
Sort Key: timestamp (String)

Attributes:
- projectId (String)
- versionId (String)
- userId (String)
- eventType (String)
- feedbackType (String)
- metadata (Map)
```

#### S3 + CloudFront

**S3 Bucket**:
- Versioning enabled
- Lifecycle: Archive to Glacier after 30 days
- CORS enabled for frontend
- Organized by projectId/versionId

**CloudFront Distribution**:
- Origin: S3 bucket
- Cache policy: Optimized for images
- HTTPS only
- Global edge locations

### Authentication Layer

**Cognito User Pool**:
- Email-based sign-in
- Password requirements: 8+ chars, mixed case, numbers, symbols
- Email verification required
- MFA optional
- Account recovery via email

**Flow**:
1. User signs up → Cognito sends verification email
2. User verifies → Account activated
3. User signs in → Cognito returns JWT tokens
4. Frontend stores tokens → Amplify handles refresh
5. API requests include Authorization header
6. API Gateway validates token → Routes to Lambda

### External Services

#### OpenAI API

**GPT-4 Turbo**:
- Used for UI intent extraction
- Input: User story + acceptance criteria
- Output: JSON with components, layout, interactions, style

**DALL-E 3**:
- Used for image generation
- Input: Structured prompt (1792x1024 resolution)
- Output: Image URL (valid for 1 hour)
- Quality: HD

## Data Flow

### Generation Flow

```
1. User submits form
   ↓
2. Frontend validates input
   ↓
3. POST /generate with Auth token
   ↓
4. API Gateway validates token
   ↓
5. Lambda: Extract UI intents (GPT-4)
   ↓
6. Lambda: Build DALL-E prompt
   ↓
7. Lambda: Generate image (DALL-E 3)
   ↓
8. Lambda: Download image from OpenAI
   ↓
9. Lambda: Upload to S3
   ↓
10. Lambda: Save to DynamoDB
    ↓
11. Lambda: Return response
    ↓
12. Frontend displays image
```

### Refinement Flow

```
1. User adds refinement notes
   ↓
2. POST /refine with projectId + notes
   ↓
3. Lambda: Load existing project
   ↓
4. Lambda: Load latest version
   ↓
5. Lambda: Build refinement prompt
   ↓
6. Lambda: Generate new image
   ↓
7. Lambda: Upload to S3
   ↓
8. Lambda: Save new version (v2, v3, etc.)
   ↓
9. Frontend displays new version
```

## Security

### Authentication & Authorization
- All API endpoints require Cognito JWT token
- Tokens validated by API Gateway before Lambda invocation
- userId extracted from token claims

### Data Protection
- HTTPS only (TLS 1.2+)
- S3 encryption at rest (AES-256)
- DynamoDB encryption at rest
- Secrets Manager for OpenAI API key

### IAM Permissions
- Lambda functions use least-privilege IAM roles
- Read-only access where possible
- Scoped to specific resources (tables, buckets)

## Scalability

### Horizontal Scaling
- Lambda: Automatic scaling (up to 1000 concurrent executions)
- API Gateway: Handles high throughput with throttling
- DynamoDB: On-demand capacity (auto-scaling)
- S3: Unlimited storage
- CloudFront: Global CDN with edge caching

### Performance Optimizations
- CloudFront caching for images (1 year TTL)
- DynamoDB GSI for efficient user queries
- Lambda memory tuning (1024 MB for generation)
- API Gateway caching (optional)

## Monitoring & Logging

### CloudWatch
- Lambda logs (all invocations)
- API Gateway access logs
- DynamoDB metrics (read/write capacity)
- Custom metrics (generation time, success rate)

### Alarms
- Lambda error rate > 5%
- API Gateway 5xx errors > 1%
- DynamoDB throttling
- Cost alerts (monthly budget)

## Disaster Recovery

### Backups
- DynamoDB: Point-in-time recovery (PITR) in production
- S3: Versioning enabled
- CloudFormation templates in version control

### Multi-Region (Future)
- Primary: us-east-1
- Failover: us-west-2
- DynamoDB global tables
- S3 cross-region replication

## Cost Optimization

### Strategies
- Lambda: Right-sized memory allocation
- DynamoDB: On-demand pricing (pay per request)
- S3: Glacier archival for old images
- CloudFront: Optimize cache TTL
- Reserved capacity for production (future)

## Future Enhancements

1. **WebSocket Support**: Real-time generation updates
2. **Batch Processing**: Generate multiple variants
3. **Image Editing**: Post-generation modifications
4. **Collaboration**: Share projects with team
5. **Advanced Analytics**: User behavior tracking
6. **Design System Import**: Custom style presets

---

*Architecture Version: 1.0*
*Last Updated: 2025-10-14*
