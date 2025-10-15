# Development Setup Guide

This guide will help you set up your local development environment for CanvasAI.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** 18+ and npm
- **Python** 3.11+
- **Git**

### AWS Tools
- **AWS CLI** - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **AWS CDK CLI** - Install globally: `npm install -g aws-cdk`

### API Keys
- **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com/)

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd CanvasAI
```

## Step 2: Environment Configuration

### Create Development Environment File

```bash
cp .env.example .env.development
```

### Edit `.env.development`

Open the file and configure these critical values:

```bash
# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE

# AWS Configuration
AWS_ACCOUNT_ID=123456789012  # Your AWS account ID
AWS_REGION=us-east-1         # Your preferred region
ENVIRONMENT=dev

# Frontend (will be populated after CDK deployment)
VITE_API_URL=http://localhost:3000/dev
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=         # Leave empty for now
VITE_USER_POOL_CLIENT_ID=  # Leave empty for now
```

### Get Your AWS Account ID

```bash
aws sts get-caller-identity --query Account --output text
```

## Step 3: Deploy AWS Infrastructure

### Configure AWS Credentials

```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, and default region.

### Bootstrap CDK (First Time Only)

```bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1

cd infrastructure
cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION
```

### Install Dependencies

```bash
npm install
```

### Deploy All Stacks

```bash
npm run deploy
```

This will deploy:
- DatabaseStack (DynamoDB tables)
- StorageStack (S3 + CloudFront)
- AuthStack (Cognito)
- ApiStack (API Gateway + Lambda functions)

### Save CDK Outputs

After deployment completes, you'll see output values like:

```
CanvasAI-Api-dev.ApiUrl = https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/
CanvasAI-Auth-dev.UserPoolId = us-east-1_xxxxxxx
CanvasAI-Auth-dev.UserPoolClientId = xxxxxxxxxxxxxxxxxx
```

**Important**: Copy these values and update your `.env.development` file:

```bash
VITE_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/
VITE_USER_POOL_ID=us-east-1_xxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxx
```

## Step 4: Backend Setup

### Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### Activate Virtual Environment

**Linux/Mac:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Tests

```bash
pytest
```

## Step 5: Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Start Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

## Step 6: Verify Setup

### Check API Connection

Open your browser to `http://localhost:5173` and verify:

1. The app loads without errors
2. You can see the login/signup page
3. Browser console shows no API connection errors

### Test Authentication

1. Click "Sign Up" and create a test account
2. Verify you receive a verification email
3. Verify the verification code
4. Sign in with your credentials

## Development Workflow

### Frontend Development

```bash
cd frontend
npm run dev      # Start dev server with hot reload
npm run build    # Production build
npm run lint     # Check for linting issues
```

Access the app at `http://localhost:5173`

### Backend Development

Since backend code runs on Lambda, local testing uses pytest:

```bash
cd backend
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pytest                     # Run all tests
pytest -v                  # Verbose output
pytest --cov              # With coverage
```

To test Lambda functions locally, you can use AWS SAM CLI or invoke them directly via AWS CLI.

### Infrastructure Changes

When you make changes to CDK code:

```bash
cd infrastructure
npm run diff     # Preview changes
npm run deploy   # Deploy changes
```

## Common Issues

### Issue: CDK Bootstrap Fails

**Solution**: Ensure AWS credentials are configured correctly:
```bash
aws sts get-caller-identity
```

### Issue: Lambda Deployment Fails

**Solution**: Make sure backend dependencies are installed:
```bash
cd backend && pip install -r requirements.txt
```

### Issue: Frontend Can't Connect to API

**Solution**:
1. Verify `.env.development` has correct `VITE_API_URL`
2. Check API Gateway CORS settings
3. Verify Cognito User Pool IDs are correct

### Issue: OpenAI API Errors

**Solution**:
1. Verify your OpenAI API key is valid
2. Check your OpenAI account has sufficient credits
3. Verify the key has access to GPT-4 and DALL-E 3

## Next Steps

1. Review the [PLAN.md](./PLAN.md) for the full implementation roadmap
2. Check backend/README.md for Lambda function details
3. Review infrastructure/README.md for AWS architecture
4. Start implementing Phase 3 (Backend Logic)

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## Getting Help

- Check the main [README.md](../README.md)
- Review stack-specific READMEs (backend/, infrastructure/)
- Open an issue on GitHub
- Check AWS CloudWatch logs for Lambda errors

---

**Happy Coding!**
