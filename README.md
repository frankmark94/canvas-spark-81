# CanvasAI

> AI-powered design assistant that transforms user stories into visual mockups using OpenAI's DALL-E and GPT-4.

CanvasAI helps product managers and UX designers rapidly prototype UI designs by generating high-quality mockups from written requirements. Iterate on designs with natural language refinements, compare versions, and export your work.

## Features

- **AI-Powered Generation**: Converts user stories and acceptance criteria into visual mockups
- **Iterative Refinement**: Refine designs with natural language instructions
- **Version History**: Track and compare design iterations
- **Project Management**: Organize and manage multiple design projects
- **Export Capabilities**: Download designs and project data

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- shadcn/ui (component library with Radix UI)
- TailwindCSS (styling with glassmorphism design system)
- React Query (data fetching)
- React Router (navigation)
- AWS Amplify (authentication)

### Backend
- Python 3.11 (Lambda runtime)
- OpenAI API (GPT-4 for intent extraction, DALL-E 3 for image generation)
- AWS Lambda (serverless compute)
- DynamoDB (database)
- S3 + CloudFront (image storage and delivery)

### Infrastructure
- AWS CDK (TypeScript)
- API Gateway (REST API)
- Cognito (authentication)
- CloudWatch (monitoring)

## Project Structure

```
CanvasAI/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
│   └── package.json
├── backend/           # Python Lambda functions
│   ├── shared/            # Shared utilities
│   │   ├── openai_client.py
│   │   ├── dynamodb_client.py
│   │   ├── s3_client.py
│   │   └── prompt_builder.py
│   ├── lambdas/           # Lambda handlers
│   │   ├── generate_design.py
│   │   ├── refine_design.py
│   │   └── get_projects.py
│   └── tests/             # Unit tests
├── infrastructure/    # AWS CDK stacks
│   ├── lib/
│   │   ├── database-stack.ts
│   │   ├── storage-stack.ts
│   │   ├── auth-stack.ts
│   │   └── api-stack.ts
│   └── bin/app.ts
├── scripts/          # Utility scripts
├── docs/             # Documentation
└── .github/          # CI/CD workflows
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- AWS CLI configured with credentials
- AWS CDK CLI: `npm install -g aws-cdk`
- OpenAI API key

### 1. Clone and Setup

```bash
git clone <repository-url>
cd CanvasAI
```

### 2. Environment Configuration

Copy `.env.example` to `.env.development` and fill in your values:

```bash
cp .env.example .env.development
```

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- AWS configuration (will be provided by CDK after deployment)

### 3. Deploy Infrastructure

```bash
cd infrastructure
npm install
npm run deploy
```

Note the output values (API URL, User Pool IDs, etc.) and update your `.env.development` file.

### 4. Install Backend Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Development

### Frontend Development

```bash
cd frontend
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Run linting
```

### Backend Development

```bash
cd backend
source venv/bin/activate
pytest            # Run tests
pytest --cov      # Run tests with coverage
```

### Infrastructure Development

```bash
cd infrastructure
npm run synth     # Generate CloudFormation templates
npm run diff      # View infrastructure changes
npm run deploy    # Deploy to AWS
```

## Architecture

### Design Generation Flow

1. User submits user story + acceptance criteria
2. Frontend sends request to API Gateway (authenticated with Cognito)
3. Lambda function receives request
4. GPT-4 extracts UI components and layout from requirements
5. DALL-E 3 generates visual mockup based on extracted intents
6. Image uploaded to S3, metadata saved to DynamoDB
7. Frontend receives image URL and displays result

### Data Models

**Projects Table (DynamoDB)**
- PK: `projectId` (UUID)
- SK: `versionId` (v1, v2, v3...)
- Attributes: userId, userStory, acceptanceCriteria, imageUrl, timestamp, etc.
- GSI: UserProjectsIndex (userId, timestamp)

**Analytics Table (DynamoDB)**
- PK: `analyticsId`
- SK: `timestamp`
- Attributes: projectId, eventType, metadata

## Current Status

**Phase 1: ✅ Complete** - Project setup and structure
- Directory structure created
- Frontend foundation migrated
- Backend stubs created
- Infrastructure stubs created
- Git repository initialized

**Phase 2: 🔄 Next** - AWS Infrastructure deployment
- Deploy DynamoDB tables
- Configure S3 and CloudFront
- Set up Cognito authentication
- Deploy API Gateway and Lambda stubs

**Phase 3: 📋 Planned** - Backend implementation
**Phase 4: 📋 Planned** - Frontend enhancements
**Phase 5: 📋 Planned** - OpenAI integration
**Phase 6: 📋 Planned** - Testing
**Phase 7: 📋 Planned** - Deployment automation
**Phase 8: 📋 Planned** - Documentation

See [PLAN.md](./docs/PLAN.md) for detailed implementation roadmap.

## Cost Estimates

### Development (~100 users, 500 generations/month)
- AWS Services: ~$16.50/month
- OpenAI API: ~$45/month
- **Total**: ~$61.50/month

### Production Scale (~1000 users, 5K generations/month)
- AWS Services: ~$150/month
- OpenAI API: ~$450/month
- **Total**: ~$600/month

See infrastructure README for detailed cost breakdown.

## Contributing

This project follows a phased development approach. See the implementation plan for current priorities.

## License

MIT

## Support

For issues and questions, please check the [documentation](./docs/) or open an issue on GitHub.

---

**Built with**:
- OpenAI GPT-4 & DALL-E 3
- AWS Cloud Services
- React & TypeScript
- Python

*Last Updated: 2025-10-14*
