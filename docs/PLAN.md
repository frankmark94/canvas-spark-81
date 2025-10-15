# CanvasAI Implementation Plan

## Project Overview
CanvasAI is a generative design assistant that helps product managers and UX designers translate user stories into visual mockups using OpenAI's DALL-E API and AWS infrastructure.

---

## **What Already Exists**

### Frontend Foundation (from canvas-spark-81)
✅ **Tech Stack:**
- Vite + React 18 + TypeScript
- Shadcn/ui (complete Radix UI component library)
- TailwindCSS with custom glassmorphism design system
- React Query (TanStack Query) for data fetching
- React Router for navigation
- React Hook Form + Zod for validation
- Lucide React icons

✅ **Existing Components:**
- `Header`: Branding and navigation
- `InputPanel`: User story + acceptance criteria input with example templates
- `ExamplePrompts`: Pre-built user story templates
- `CanvasArea`: Display area for generated mockups
- Complete shadcn/ui component library (40+ components)

✅ **Design System:**
- Dark theme with blue/purple gradient accents
- Glassmorphism effects with backdrop blur
- Responsive grid layouts
- Custom animations and transitions

---

## **Implementation Phases**

### **Phase 1: Project Setup & Migration**

#### 1.1 Initialize Project Structure
```
CanvasAI/
├── frontend/          # React/Vite application
├── backend/           # Python Lambda functions
├── infrastructure/    # AWS CDK (TypeScript)
├── scripts/          # Utility scripts
├── docs/             # Documentation
├── .github/          # CI/CD workflows
└── PLAN.md          # This file
```

#### 1.2 Copy UI Foundation
- Copy entire `temp-ui-reference` to `frontend/`
- Update `package.json` name and version
- Add environment variable configuration
- Add missing dependencies:
  - `@aws-amplify/ui-react`
  - `aws-amplify`
  - `axios`

#### 1.3 Initialize Git Repository
- Create `.gitignore` for Node, Python, CDK
- Initialize with README.md
- Set up branch protection (main)

---

### **Phase 2: AWS Infrastructure (CDK)**

#### 2.1 CDK Project Setup
```bash
cd infrastructure
cdk init app --language typescript
```

**Stacks to Create:**
- `DatabaseStack`: DynamoDB tables
- `StorageStack`: S3 buckets + CloudFront
- `AuthStack`: Cognito User Pool
- `ApiStack`: API Gateway + Lambda functions
- `FrontendStack`: Amplify or CloudFront hosting

#### 2.2 Database Stack (DynamoDB)

**ProjectsTable Schema:**
```
PK: projectId (String) - UUID
SK: versionId (String) - v1, v2, v3...
Attributes:
  - userId (String)
  - userStory (String)
  - acceptanceCriteria (String)
  - imageUrl (String) - S3 URL
  - imageKey (String) - S3 key
  - timestamp (String) - ISO 8601
  - refinementNotes (String)
  - modelUsed (String) - "dall-e-3"
  - generationTime (Number) - milliseconds
  - prompt (String) - full prompt sent to OpenAI

GSI:
  - UserProjectsIndex: PK=userId, SK=timestamp
  - TimestampIndex: PK=timestamp (for analytics)
```

**AnalyticsTable Schema:**
```
PK: analyticsId (String)
SK: timestamp (String)
Attributes:
  - projectId (String)
  - versionId (String)
  - userId (String)
  - eventType (String) - "generation", "refinement", "feedback", "export"
  - feedbackType (String) - "thumbs_up", "thumbs_down", "comparison"
  - metadata (Map) - flexible JSON data
```

#### 2.3 Storage Stack

**S3 Bucket Configuration:**
- Bucket name: `canvasai-images-{env}`
- CORS enabled for frontend domain
- Lifecycle policy: Archive to Glacier after 30 days
- Versioning enabled
- Public read access for generated images

**CloudFront Distribution:**
- Origin: S3 bucket
- Cache policy: Optimize for images
- Custom domain (optional)

#### 2.4 Auth Stack (Cognito)

**User Pool:**
- Sign-in: Email
- Password policy: Min 8 chars, require uppercase, number, symbol
- MFA: Optional
- Email verification required
- Hosted UI enabled

**User Pool Client:**
- OAuth flows: Authorization code grant
- Scopes: openid, email, profile
- Callback URLs: Local + production

#### 2.5 API Stack

**API Gateway REST API:**
```
POST   /generate          - Generate initial design
POST   /refine            - Refine existing design
GET    /projects          - List user's projects
GET    /projects/{id}     - Get project details
GET    /versions/{id}     - Get version history
POST   /feedback          - Record user feedback
POST   /export            - Export project data
```

**Lambda Functions:**
1. `generate-design` - Main generation logic
2. `refine-design` - Refinement logic
3. `get-projects` - Query projects by user
4. `get-project-versions` - Query version history
5. `export-project` - Create downloadable export
6. `record-feedback` - Store analytics

**Lambda Configuration:**
- Runtime: Python 3.11
- Memory: 512MB (generation functions: 1024MB)
- Timeout: 30s (generation functions: 60s)
- Environment variables: DynamoDB table names, S3 bucket, OpenAI API key
- Lambda Layer: Shared dependencies (boto3, openai, pydantic)

---

### **Phase 3: Backend Implementation**

#### 3.1 Shared Utilities (`backend/shared/`)

**`openai_client.py`:**
```python
class OpenAIClient:
    """Wrapper for OpenAI API with retry logic and error handling"""

    def extract_ui_intents(self, user_story: str, criteria: str) -> str:
        """Use GPT-4 to extract UI components from user story"""

    def generate_image(self, prompt: str) -> str:
        """Generate image using DALL-E 3"""

    def build_prompt(self, user_story: str, criteria: str, style: str) -> str:
        """Build structured prompt for image generation"""
```

**`dynamodb_client.py`:**
```python
class DynamoDBClient:
    """DynamoDB operations for projects and analytics"""

    def create_project(self, project_data: dict) -> dict:
    def get_project(self, project_id: str, version_id: str) -> dict:
    def get_user_projects(self, user_id: str, limit: int) -> list:
    def get_project_versions(self, project_id: str) -> list:
    def record_analytics(self, event_data: dict) -> None:
```

**`s3_client.py`:**
```python
class S3Client:
    """S3 operations for image storage"""

    def upload_image(self, image_url: str, project_id: str, version_id: str) -> str:
        """Download from OpenAI URL and upload to S3"""

    def get_signed_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate presigned URL for private access"""

    def create_export_zip(self, project_id: str) -> str:
        """Create zip file with all versions and metadata"""
```

**`prompt_builder.py`:**
```python
class PromptBuilder:
    """Template-based prompt engineering"""

    UI_EXTRACTION_TEMPLATE = """..."""
    IMAGE_GENERATION_TEMPLATE = """..."""

    def extract_ui_components(self, user_story: str, criteria: str) -> str:
    def build_image_prompt(self, ui_components: str, style: str) -> str:
```

#### 3.2 Lambda Handler: `generate-design`

**Flow:**
1. Validate request (user_id, user_story, acceptance_criteria)
2. Call GPT-4 to extract UI intents
3. Build structured prompt for DALL-E
4. Generate image with DALL-E 3
5. Download image from OpenAI URL
6. Upload image to S3
7. Save metadata to DynamoDB
8. Record analytics event
9. Return project_id, version_id, image_url

**Error Handling:**
- OpenAI rate limits: Retry with exponential backoff
- OpenAI content policy violations: Return friendly error
- S3 upload failures: Retry 3 times
- DynamoDB errors: Log and return 500

#### 3.3 Lambda Handler: `refine-design`

**Flow:**
1. Validate request (project_id, refinement_notes)
2. Load existing project and latest version
3. Build new prompt incorporating refinement
4. Generate new image
5. Upload to S3
6. Save new version to DynamoDB (increment version_id)
7. Record analytics
8. Return new version data

#### 3.4 Lambda Handler: `get-projects`

**Flow:**
1. Validate user_id
2. Query DynamoDB UserProjectsIndex
3. Paginate results (20 per page)
4. Return list with thumbnails

#### 3.5 Lambda Handler: `export-project`

**Flow:**
1. Get all versions for project
2. Download images from S3
3. Generate metadata JSON
4. Create zip file
5. Upload zip to S3
6. Return signed download URL

---

### **Phase 4: Frontend Enhancements**

#### 4.1 API Client Layer (`frontend/src/lib/`)

**`api.ts`:**
```typescript
import axios from 'axios';
import { Auth } from 'aws-amplify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const session = await Auth.currentSession();
  config.headers.Authorization = `Bearer ${session.getIdToken().getJwtToken()}`;
  return config;
});

export const generateDesign = (data: GenerateRequest) =>
  api.post('/generate', data);

export const refineDesign = (data: RefineRequest) =>
  api.post('/refine', data);

export const getProjects = (page: number = 1) =>
  api.get(`/projects?page=${page}`);
```

**React Query Hooks:**
```typescript
// hooks/useGenerate.ts
export const useGenerate = () => {
  return useMutation({
    mutationFn: generateDesign,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['projects']);
    },
  });
};

// hooks/useProjects.ts
export const useProjects = (page: number) => {
  return useQuery({
    queryKey: ['projects', page],
    queryFn: () => getProjects(page),
  });
};
```

#### 4.2 Authentication Setup

**`lib/amplify.ts`:**
```typescript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: 'CanvasAI',
        endpoint: import.meta.env.VITE_API_URL,
      },
    ],
  },
});
```

**Protected Route Component:**
```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return children;
};
```

#### 4.3 New Pages

**Dashboard (`pages/Dashboard.tsx`):**
- Grid of project cards (4 columns on desktop)
- Each card: thumbnail, title (derived from user story), timestamp
- Search and filter controls
- "New Project" button → navigate to Index
- Pagination controls

**Compare View (`pages/Compare.tsx`):**
- Side-by-side image display
- Metadata comparison (prompts, timestamps)
- Preference selection (radio buttons)
- Save preference to analytics

**Analytics Dashboard (`pages/Analytics.tsx`):**
- Total projects created
- Average iterations per project
- Generation time chart (Recharts)
- User satisfaction score
- Most common refinements (word cloud?)

**Login/Signup Pages:**
- Use Amplify UI components
- Social sign-in (optional)
- Redirect to dashboard after login

#### 4.4 Enhanced Components

**Version History Sidebar:**
```typescript
// components/VersionHistory.tsx
<ScrollArea className="h-full">
  {versions.map((version) => (
    <div key={version.versionId} onClick={() => loadVersion(version)}>
      <img src={version.imageUrl} />
      <span>{version.versionId}</span>
      <span>{formatDate(version.timestamp)}</span>
    </div>
  ))}
</ScrollArea>
```

**Refinement Modal:**
```typescript
// components/RefinementModal.tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>Refine Design</DialogHeader>
    <Textarea
      placeholder="Add a dark mode toggle..."
      value={refinementNotes}
    />
    <Button onClick={handleRefine} disabled={isRefining}>
      Apply Refinement
    </Button>
  </DialogContent>
</Dialog>
```

**Project Card:**
```typescript
// components/ProjectCard.tsx
<Card className="glass hover:shadow-glass transition-all">
  <img src={project.thumbnailUrl} className="aspect-video" />
  <CardHeader>
    <CardTitle>{extractTitle(project.userStory)}</CardTitle>
  </CardHeader>
  <CardFooter>
    <span>{project.versionCount} versions</span>
    <span>{formatDate(project.timestamp)}</span>
  </CardFooter>
</Card>
```

---

### **Phase 5: OpenAI Integration**

#### 5.1 Prompt Templates

**UI Intent Extraction (GPT-4):**
```
You are a UX/UI expert. Analyze the following user story and acceptance criteria,
then extract the key UI components and layout suggestions.

User Story:
{user_story}

Acceptance Criteria:
{criteria}

Provide:
1. List of UI components needed (e.g., search bar, filter dropdown, product cards)
2. Suggested layout structure
3. Key interaction patterns
4. Visual style recommendations

Format as JSON.
```

**Image Generation (DALL-E 3):**
```
Create a modern web application interface mockup with the following specifications:

UI Components: {components}
Layout: {layout}
Interaction Patterns: {interactions}

Style Requirements:
- Design system: Glassmorphism with soft gradients
- Color palette: Dark theme with blue (#4F7FFF) and purple (#7F4FFF) accents
- Typography: Clean sans-serif, hierarchy with size and weight
- Spacing: Generous padding, clear visual grouping
- Imagery: High-quality, contextual illustrations

Technical Specs:
- View: Desktop/web application
- Resolution: 1792x1024
- Format: Modern, minimalistic, professional

Additional Context:
{refinement_notes}

Ensure the design is:
- Visually balanced and harmonious
- Follows modern UI/UX best practices
- Accessible with good contrast ratios
- Production-ready in appearance
```

#### 5.2 Error Handling

**OpenAI API Errors:**
- `401 Unauthorized`: Invalid API key → log alert
- `429 Rate Limit`: Retry with exponential backoff (max 3 retries)
- `400 Bad Request` (content policy): Return user-friendly message
- `500 Server Error`: Retry once, then fail gracefully

**Response Validation:**
- Check image URL is valid
- Verify image is downloadable
- Validate image format (PNG)
- Check image size (< 10MB)

---

### **Phase 6: Testing & Quality**

#### 6.1 Backend Tests

**Unit Tests (`backend/tests/`):**
```python
# test_openai_client.py
def test_extract_ui_intents_success(mock_openai):
    client = OpenAIClient()
    result = client.extract_ui_intents("As a user...", "Criteria...")
    assert "components" in result

# test_dynamodb_client.py
@mock_dynamodb
def test_create_project():
    client = DynamoDBClient()
    project = client.create_project({...})
    assert project['projectId']
```

**Integration Tests:**
```python
# test_generate_lambda.py
def test_generate_design_flow(localstack):
    event = {...}
    result = handler(event, context)
    assert result['statusCode'] == 200
    assert 'imageUrl' in json.loads(result['body'])
```

#### 6.2 Frontend Tests

**Component Tests:**
```typescript
// __tests__/InputPanel.test.tsx
test('validates required fields', () => {
  render(<InputPanel />);
  fireEvent.click(screen.getByText('Generate Mockup'));
  expect(screen.getByText('User story is required')).toBeInTheDocument();
});
```

**E2E Tests (Playwright):**
```typescript
// e2e/generation-flow.spec.ts
test('complete generation flow', async ({ page }) => {
  await page.goto('/');
  await page.fill('#user-story', 'As a user...');
  await page.fill('#acceptance-criteria', 'Criteria...');
  await page.click('button:has-text("Generate Mockup")');
  await expect(page.locator('img[alt="Generated mockup"]')).toBeVisible();
});
```

#### 6.3 Manual Testing Checklist
- [ ] Generate design from scratch
- [ ] Refine existing design
- [ ] View version history
- [ ] Compare two versions
- [ ] Export project
- [ ] Dashboard filtering
- [ ] Mobile responsive layout
- [ ] Authentication flow
- [ ] Error states (network failure, rate limits)

---

### **Phase 7: Deployment**

#### 7.1 Environment Setup

**Development Environment:**
```bash
# .env.development
VITE_API_URL=http://localhost:3000/dev
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_devpool
OPENAI_API_KEY=sk-...
```

**Production Environment:**
```bash
# .env.production
VITE_API_URL=https://api.canvasai.com
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_prodpool
```

#### 7.2 CDK Deployment

```bash
# Install dependencies
cd infrastructure
npm install

# Bootstrap CDK (first time only)
cdk bootstrap aws://ACCOUNT-ID/REGION

# Deploy all stacks
cdk deploy --all --require-approval never

# Or deploy specific stack
cdk deploy DatabaseStack
```

#### 7.3 CI/CD Pipeline (GitHub Actions)

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy CanvasAI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Backend tests
      - name: Test Backend
        run: |
          cd backend
          pip install -r requirements.txt
          pytest

      # Frontend tests
      - name: Test Frontend
        run: |
          cd frontend
          npm ci
          npm run lint
          npm run test

  deploy-infrastructure:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy CDK
        run: |
          cd infrastructure
          npm ci
          npx cdk deploy --all --require-approval never

  deploy-frontend:
    needs: deploy-infrastructure
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Amplify
        run: |
          cd frontend
          npm ci
          npm run build
          aws s3 sync dist/ s3://canvasai-frontend-bucket
```

#### 7.4 Monitoring Setup

**CloudWatch Dashboards:**
- Lambda invocations, errors, duration
- API Gateway requests, latency, 4xx/5xx
- DynamoDB read/write capacity
- S3 bucket size and requests

**Cost Monitoring:**
- AWS Budget with alerts at 80%, 100%
- Cost Explorer tags by service

---

### **Phase 8: Documentation**

#### 8.1 API Documentation (`docs/API.md`)

Document all endpoints with:
- Request/response schemas
- Authentication requirements
- Example cURL commands
- Error codes and messages

#### 8.2 Deployment Guide (`docs/DEPLOYMENT.md`)

Step-by-step instructions for:
- Prerequisites (AWS CLI, Node, Python, CDK)
- Environment setup
- Infrastructure deployment
- Frontend deployment
- Secrets management
- Domain configuration

#### 8.3 Architecture Diagram (`docs/ARCHITECTURE.md`)

Create diagrams showing:
- System overview (user → frontend → API → Lambda → services)
- Database schema
- Authentication flow
- Generation flow sequence diagram

#### 8.4 User Guide

Screenshots and instructions for:
- Creating first project
- Refining designs
- Comparing versions
- Exporting projects

---

## **Key Dependencies**

### Backend
```
boto3>=1.34.0          # AWS SDK
openai>=1.10.0         # OpenAI API client
pydantic>=2.5.0        # Data validation
requests>=2.31.0       # HTTP client
python-dotenv>=1.0.0   # Environment variables
pytest>=7.4.0          # Testing
moto>=4.2.0            # AWS mocking
```

### Frontend
```
react@^18.3.1
react-router-dom@^6.30.1
@tanstack/react-query@^5.83.0
@aws-amplify/ui-react@^6.0.0
aws-amplify@^6.0.0
axios@^1.6.0
@hookform/resolvers@^3.10.0
react-hook-form@^7.61.1
zod@^3.25.76
shadcn/ui components (via @radix-ui/*)
tailwindcss@^3.4.17
lucide-react@^0.462.0
```

### Infrastructure
```
aws-cdk-lib@^2.120.0
constructs@^10.3.0
@types/node
```

---

## **Success Metrics**

### Technical Metrics
- [ ] Generation latency < 10 seconds (p95)
- [ ] API availability > 99.5%
- [ ] Error rate < 1%
- [ ] Frontend Lighthouse score > 90

### Business Metrics
- [ ] User satisfaction (thumbs up rate) > 70%
- [ ] Average iterations per project: 2-3
- [ ] Daily active users growth
- [ ] Project completion rate

---

## **Future Enhancements**

### Phase 2 Features
1. **Figma Plugin**: Export designs directly to Figma
2. **Collaboration**: Share projects with team members
3. **Style Presets**: Material, Fluent, Glassmorphism templates
4. **Design System Import**: Upload existing design tokens
5. **Component Code Generation**: Generate React/Vue components
6. **WebSocket Support**: Real-time collaboration
7. **Version Branching**: Create alternate design branches
8. **AI Chat Interface**: Conversational refinement
9. **Batch Generation**: Generate multiple variants at once
10. **Custom Models**: Fine-tune on company design system

---

## **Risk Mitigation**

### OpenAI API Risks
- **Rate Limits**: Implement queue system with Redis
- **Cost Overruns**: Set daily spend limits, cache results
- **Service Downtime**: Implement fallback to cached examples

### AWS Risks
- **Cost Spikes**: CloudWatch alarms, budget alerts
- **Regional Outages**: Multi-region deployment (future)
- **DDoS**: API Gateway throttling, WAF rules

### Security Risks
- **API Key Exposure**: Use Secrets Manager, rotate keys
- **CORS Issues**: Whitelist specific domains
- **Injection Attacks**: Validate all inputs with Zod/Pydantic

---

## **Development Commands**

```bash
# Frontend Development
cd frontend
npm install
npm run dev              # http://localhost:5173

# Backend Local Testing
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest

# Infrastructure
cd infrastructure
npm install
cdk synth                # Generate CloudFormation
cdk diff                 # Show changes
cdk deploy              # Deploy to AWS
cdk destroy             # Clean up resources

# Seed Data
python scripts/seed_data.py --env dev --count 20
```

---

## **Cost Estimation**

### Monthly AWS Costs (Low Traffic: 100 users, 500 generations/month)
- **Lambda**: ~$5 (1M requests free tier)
- **API Gateway**: ~$3.50 (1M requests = $3.50)
- **DynamoDB**: ~$2 (On-demand, 1M reads/writes)
- **S3**: ~$5 (50GB storage + transfer)
- **CloudFront**: ~$1 (1GB transfer)
- **Cognito**: Free (< 50K MAU)
- **Total AWS**: ~$16.50/month

### OpenAI Costs
- **DALL-E 3 HD (1792x1024)**: $0.08 per image
- **GPT-4 Turbo**: ~$0.01 per intent extraction
- **500 generations**: ~$45/month
- **Total OpenAI**: ~$45/month

### **Total Monthly**: ~$61.50

### Scale Estimates (1000 users, 5K generations/month)
- **AWS**: ~$150/month
- **OpenAI**: ~$450/month
- **Total**: ~$600/month

---

## **Timeline Estimate**

**Phase 1-2 (Infrastructure)**: 1-2 weeks
**Phase 3 (Backend)**: 1-2 weeks
**Phase 4 (Frontend)**: 1-2 weeks
**Phase 5-6 (Integration & Testing)**: 1 week
**Phase 7-8 (Deployment & Docs)**: 1 week

**Total MVP**: 5-8 weeks

---

## **Contact & Support**

- **Repository**: [GitHub Link]
- **Documentation**: [Docs Link]
- **Issues**: [GitHub Issues]
- **Slack/Discord**: [Community Link]

---

*Last Updated: 2025-10-14*
