# CanvasAI Backend

Python backend for CanvasAI, designed to run on AWS Lambda.

## Structure

```
backend/
├── shared/                 # Shared utilities and clients
│   ├── openai_client.py   # OpenAI API wrapper (GPT-4 + DALL-E 3)
│   ├── dynamodb_client.py # DynamoDB operations
│   ├── s3_client.py       # S3 image storage
│   └── prompt_builder.py  # Prompt templates
├── lambdas/               # Lambda function handlers
│   ├── generate_design.py # Generate initial design
│   ├── refine_design.py   # Refine existing design
│   └── get_projects.py    # Retrieve user projects
├── tests/                 # Unit and integration tests
└── requirements.txt       # Python dependencies
```

## Setup

### Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the backend directory:

```bash
OPENAI_API_KEY=sk-proj-...
DYNAMODB_PROJECTS_TABLE=CanvasAI-Projects-dev
DYNAMODB_ANALYTICS_TABLE=CanvasAI-Analytics-dev
S3_IMAGES_BUCKET=canvasai-images-dev
```

## Development

### Running Tests

```bash
pytest
```

### Running Tests with Coverage

```bash
pytest --cov=shared --cov=lambdas --cov-report=html
```

## Lambda Functions

### generate_design

Generates initial design mockup from user story and acceptance criteria.

**Input:**
```json
{
  "userId": "string",
  "userStory": "As a user...",
  "acceptanceCriteria": "• Criterion 1..."
}
```

**Output:**
```json
{
  "projectId": "uuid",
  "versionId": "v1",
  "imageUrl": "https://...",
  "timestamp": "2025-10-14T..."
}
```

### refine_design

Refines an existing design with new instructions.

**Input:**
```json
{
  "projectId": "uuid",
  "userId": "string",
  "refinementNotes": "Add dark mode toggle..."
}
```

### get_projects

Retrieves user's projects with pagination.

**Query Parameters:**
- `userId` (required)
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

## Deployment

Lambda functions are deployed via AWS CDK. See `/infrastructure` for deployment configuration.

## Current Status

**Phase 1 Complete**: Backend structure and stubs created.

**TODO for Phase 3**:
- [ ] Implement OpenAI client logic
- [ ] Implement DynamoDB operations
- [ ] Implement S3 upload/download
- [ ] Add error handling and retry logic
- [ ] Write unit tests
- [ ] Write integration tests
