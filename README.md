# Generator README AI - Backend

A sophisticated backend service for generating comprehensive project documentation using GPT-4. This service processes project specifications and generates professional README files, detects configuration conflicts, and creates detailed test plans.

## 📋 Features

- 🤖 **AI-Powered README Generation** - Uses OpenAI GPT to generate professional documentation
- 🔍 **Intelligent Conflict Detection** - Identifies inconsistencies in project configurations
- 📝 **Test Planning** - Generates comprehensive test strategies and test cases
- ⚡ **High Performance** - Built with Fastify for maximum speed
- 🔒 **Type Safe** - Full TypeScript support with strict mode
- 🌐 **CORS Enabled** - Ready for frontend integration

## 🛠️ Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: Fastify 4+
- **Language**: TypeScript (strict mode)
- **AI Integration**: OpenAI GPT API
- **Validation**: Zod
- **Testing**: Jest
- **Dev Tools**: tsx, ESLint, Prettier

## 📦 Prerequisites

- Node.js 20.0 or higher
- npm 10.0 or higher
- OpenAI API key (get one at https://platform.openai.com/api-keys)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-api-key-here
FRONTEND_URL=http://localhost:3000
```

### 3. Development

Start the development server with hot reloading:

```bash
npm run dev
```

The server will start at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
```

### 5. Start Production Server

```bash
npm start
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

Returns server status.

### API Info
```
GET /api/info
```

Returns API information and available endpoints.

### Generate README
```
POST /api/generate
```

**Request Body** (ProjectSpec):
```json
{
  "meta": {
    "projectName": "My Project",
    "summary": "Project description...",
    "tooling": {
      "primaryAI": "gpt",
      "generateAIConfigs": true
    }
  },
  "stack": {
    "type": "fullstack",
    "frontend": { "framework": "Next.js", "language": "TypeScript", "libraries": [] },
    "backend": { "framework": "Fastify", "language": "TypeScript", "libraries": [] },
    "database": { "type": null, "provider": null, "schemaFormat": "mermaid" },
    "architecture": "monolith"
  }
  // ... (see types/project.ts for complete schema)
}
```

**Response**:
```json
{
  "readme": "# My Project\n\n...",
  "integrity": {
    "conflicts": [],
    "warnings": [],
    "suggestions": []
  }
}
```

### Detect Conflicts
```
POST /api/detect-conflicts
```

Analyzes a ProjectSpec for configuration conflicts and inconsistencies.

**Request Body**: ProjectSpec (same as above)

**Response**:
```json
{
  "conflicts": [
    {
      "type": "error",
      "code": "AUTH_NO_ROLES",
      "message": "Authentication is enabled but no roles are defined",
      "suggestion": "Add at least one role (e.g., admin, user, guest)"
    }
  ],
  "warnings": [],
  "suggestions": []
}
```

### Generate Test Plan
```
POST /api/tests-plan
```

Generates a comprehensive test plan from ProjectSpec.

**Request Body**: ProjectSpec

**Response**:
```json
{
  "unitTests": [
    {
      "name": "Auth - Valid Credentials",
      "description": "Test login with valid email and password",
      "steps": ["..."],
      "expectedResult": "User is authenticated and token is returned"
    }
  ],
  "integrationTests": [],
  "e2eTests": [],
  "manualChecks": []
}
```

## 🏗️ Project Structure

```
src/
  ├── index.ts                 # Main server entry point
  ├── routes/
  │   ├── generate.ts         # README generation endpoint
  │   ├── conflicts.ts        # Conflict detection endpoint
  │   └── tests.ts            # Test planning endpoint
  ├── services/
  │   ├── openaiClient.ts     # OpenAI API client
  │   ├── readmeBuilder.ts    # README generation logic
  │   ├── conflictDetector.ts # Conflict detection rules
  │   └── testsPlanner.ts     # Test planning logic
  └── types/
      └── project.ts          # TypeScript types and schemas
tests/
  ├── services/
  │   ├── conflictDetector.test.ts
  │   └── readmeBuilder.test.ts
  └── routes/
      └── generate.test.ts
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## 📝 Services Documentation

### ConflictDetector

Implements 12+ rules to detect configuration conflicts:

- Auth without roles
- API without backend
- Features without entities
- E2E tests without API
- Microservices without multiple services
- And more...

### ReadmeBuilder

Generates comprehensive READMEs with sections:

1. Project Title
2. Table of Contents
3. Overview
4. Tech Stack
5. Features
6. Getting Started
7. Project Structure
8. Data Model
9. API Documentation
10. Testing
11. Deployment
12. Contributing
13. License

### TestsPlanner

Creates test plans including:

- **Unit Tests**: Individual component/function tests
- **Integration Tests**: Multi-component interaction tests
- **E2E Tests**: Complete user workflow tests
- **Manual Checks**: Cross-browser, performance, security, accessibility

## 🔧 Configuration

All configuration is done through environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| HOST | Server host | 0.0.0.0 |
| OPENAI_API_KEY | Your OpenAI API key | (required) |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |
| NODE_ENV | Environment | development |

## 🚢 Deployment

### Render

```bash
# Create new service on Render
# Select GitHub repo
# Add environment variables:
# - OPENAI_API_KEY
# - FRONTEND_URL (production URL)
# Deploy
```

### Railway

```bash
npm install -g @railway/cli
railway link
railway up
```

### Fly.io

```bash
npm install -g flyctl
flyctl auth login
flyctl launch
flyctl secrets set OPENAI_API_KEY=sk-...
flyctl deploy
```

## 📚 API Documentation

Full API documentation is available at:
```
GET http://localhost:3001/api/info
```

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Commit: `git commit -am 'Add my feature'`
6. Push: `git push origin feature/my-feature`

## 🐛 Troubleshooting

### "Cannot find module 'openai'"

```bash
npm install
```

### "OPENAI_API_KEY is not set"

1. Create `.env` file
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart the server

### CORS Errors

Update `FRONTEND_URL` in `.env` to match your frontend URL.

## 📄 License

MIT - See LICENSE file for details

## 🙋 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review test cases for usage examples

---

**Made with ❤️ for developers**
