# Backend TODO - Out of Code Tasks

## 1. OpenAI API Setup ⭐ CRITICAL

- [ ] Create account at https://platform.openai.com
- [ ] Create API key in API keys section
- [ ] Copy the API key (sk-xxx format)
- [ ] Create `.env` file from `.env.example`
- [ ] Add API key to `.env`:
  ```
  OPENAI_API_KEY=sk-your-key-here
  ```
- [ ] Test the API key works:
  ```bash
  npm run dev
  # Server should start without errors
  ```

## 2. Dependencies Installation

- [ ] Run `npm install` to install all dependencies
- [ ] Verify installation completes successfully
- [ ] Check for any peer dependency warnings
- [ ] If issues occur, try `npm install --legacy-peer-deps`

## 3. Development Environment

- [ ] Set up IDE/editor (VS Code recommended)
- [ ] Install TypeScript extension for VS Code
- [ ] Configure prettier formatting (optional)
- [ ] Set up eslint for code quality (optional)

## 4. Environment Configuration

- [ ] Copy `.env.example` to `.env`
- [ ] Set `OPENAI_API_KEY`
- [ ] Set `FRONTEND_URL` to match frontend deployment
- [ ] For development: `FRONTEND_URL=http://localhost:3000`

## 5. Local Testing

- [ ] Start server: `npm run dev`
- [ ] Test health endpoint: `curl http://localhost:3001/health`
- [ ] Test info endpoint: `curl http://localhost:3001/api/info`
- [ ] Test conflict detection with sample data
- [ ] Test README generation (may require API calls)

## 6. Database (Future)

- [ ] Research database options (PostgreSQL, MongoDB)
- [ ] Design schema for storing projects
- [ ] Plan migration strategy from in-memory to persistent storage
- [ ] Create database connection service

## 7. Authentication (Future)

- [ ] Plan authentication strategy for API endpoints
- [ ] Consider JWT tokens or API keys
- [ ] Implement rate limiting per authenticated user
- [ ] Add request signing for security

## 8. Testing

- [ ] Write unit tests for `conflictDetector`
  ```bash
  npm test -- conflictDetector.test.ts
  ```
- [ ] Write unit tests for `testsPlanner`
- [ ] Write integration tests for routes
- [ ] Test error handling scenarios
- [ ] Run full test suite: `npm test`
- [ ] Generate coverage report: `npm run test:coverage`
- [ ] Aim for 80%+ code coverage

## 9. Documentation

- [ ] Update README with actual endpoints
- [ ] Add request/response examples
- [ ] Document conflict detection rules
- [ ] Create CONTRIBUTING.md
- [ ] Add architecture diagram to docs

## 10. Production Deployment

Choose one deployment platform:

### Option A: Render
- [ ] Create Render account at render.com
- [ ] Connect GitHub repository
- [ ] Create new service
- [ ] Set environment variables
- [ ] Deploy and test

### Option B: Railway
- [ ] Create Railway account
- [ ] Install Railway CLI
- [ ] Run `railway link`
- [ ] Configure environment
- [ ] Run `railway up`

### Option C: Fly.io
- [ ] Create Fly.io account
- [ ] Install flyctl
- [ ] Run `flyctl auth login`
- [ ] Run `flyctl launch`
- [ ] Set secrets
- [ ] Run `flyctl deploy`

### Common Steps for All:
- [ ] Set production `OPENAI_API_KEY`
- [ ] Update `FRONTEND_URL` to production frontend URL
- [ ] Enable logging for production
- [ ] Test all endpoints on production URL
- [ ] Set up monitoring/alerting

## 11. Monitoring & Logging

- [ ] Set up application logging
- [ ] Configure log levels
- [ ] Add error tracking (Sentry optional)
- [ ] Monitor API response times
- [ ] Set up alerts for errors

## 12. Performance Optimization

- [ ] Profile API endpoints
- [ ] Add response caching if applicable
- [ ] Optimize GPT prompts for faster generation
- [ ] Monitor token usage
- [ ] Implement request throttling

## 13. Security Audit

- [ ] Review CORS configuration
- [ ] Add request validation
- [ ] Implement rate limiting
- [ ] Sanitize inputs
- [ ] Audit dependencies for vulnerabilities: `npm audit`
- [ ] Fix security issues: `npm audit fix`

## 14. CI/CD Pipeline

- [ ] Create GitHub Actions workflow
  ```yaml
  # .github/workflows/deploy.yml
  ```
- [ ] Run tests on push
- [ ] Run linter on push
- [ ] Auto-deploy on merge to main
- [ ] Add code coverage badge to README

## 15. Integration Testing

- [ ] Test full workflow from frontend to backend
- [ ] Test with various ProjectSpec configurations
- [ ] Stress test with large payloads
- [ ] Test error scenarios
- [ ] Load testing

## Notes

- API calls to OpenAI may incur costs - monitor usage
- Free tier provides limited tokens - upgrade if needed
- Keep API key secret - never commit to repository
- Test thoroughly before deploying to production
- Monitor error logs in production

---

**Priority**: Focus on items 1-5 first to get development working, then 8-10 for proper deployment.
