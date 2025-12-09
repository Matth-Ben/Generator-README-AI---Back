/**
 * Tests Planner
 * Generates test plans and recommendations from ProjectSpec
 */

import { ProjectSpec, TestsPlan, TestCase } from '../types/project';

/**
 * Generate a test plan from project specification
 * @param project The project specification
 * @returns Test plan with unit, integration, E2E, and manual tests
 */
export function generateTestsPlan(project: ProjectSpec): TestsPlan {
  const unitTests = generateUnitTests(project);
  const integrationTests = generateIntegrationTests(project);
  const e2eTests = generateE2eTests(project);
  const manualChecks = generateManualChecks(project);

  return {
    unitTests,
    integrationTests,
    e2eTests,
    manualChecks,
  };
}

/**
 * Generate unit test cases
 */
function generateUnitTests(project: ProjectSpec): TestCase[] {
  const tests: TestCase[] = [];

  // Auth unit tests
  if (project.auth.enabled) {
    tests.push({
      name: 'Authentication - Valid Credentials',
      description: 'Test login with valid email and password',
      steps: [
        'Create a test user account',
        'Attempt login with valid credentials',
        'Verify auth token is generated',
      ],
      expectedResult: 'User is authenticated and token is returned',
    });

    tests.push({
      name: 'Authentication - Invalid Credentials',
      description: 'Test login with invalid password',
      steps: [
        'Attempt login with valid email but invalid password',
        'Verify error is returned',
      ],
      expectedResult: 'Login fails with appropriate error message',
    });

    if (project.auth.methods.includes('OAuth')) {
      tests.push({
        name: 'OAuth Integration',
        description: 'Test OAuth provider integration',
        steps: [
          'Redirect to OAuth provider',
          'Complete OAuth flow',
          'Verify user is created/logged in',
        ],
        expectedResult: 'User is authenticated via OAuth',
      });
    }
  }

  // Entity validation tests
  project.entities.forEach((entity) => {
    tests.push({
      name: `${entity.name} - Validation`,
      description: `Test ${entity.name} entity validation rules`,
      steps: [
        `Create a ${entity.name} with required fields`,
        'Validate all constraints are enforced',
      ],
      expectedResult: `${entity.name} is created with valid data`,
    });

    // Test unique constraints
    const uniqueFields = entity.fields.filter((f) => f.unique);
    if (uniqueFields.length > 0) {
      tests.push({
        name: `${entity.name} - Unique Constraint`,
        description: `Test unique constraint on ${uniqueFields.map((f) => f.name).join(', ')}`,
        steps: [
          `Create first ${entity.name}`,
          `Attempt to create duplicate with same ${uniqueFields[0].name}`,
        ],
        expectedResult: 'Duplicate creation fails with constraint error',
      });
    }
  });

  // API endpoint tests
  if (project.api.type === 'rest') {
    project.api.endpoints.forEach((endpoint) => {
      if (endpoint.methods.includes('GET')) {
        tests.push({
          name: `GET ${endpoint.path}`,
          description: `Test GET endpoint: ${endpoint.description}`,
          steps: [
            `Send GET request to ${endpoint.path}`,
            'Verify response status code',
            'Verify response format',
          ],
          expectedResult: 'Endpoint returns 200 OK with correct data format',
        });
      }

      if (endpoint.methods.includes('POST')) {
        tests.push({
          name: `POST ${endpoint.path}`,
          description: `Test POST endpoint: ${endpoint.description}`,
          steps: [
            `Send POST request with valid data to ${endpoint.path}`,
            'Verify response status code is 201',
            'Verify created resource is returned',
          ],
          expectedResult:
            'Resource is created and returned with 201 status',
        });
      }
    });
  }

  return tests;
}

/**
 * Generate integration test cases
 */
function generateIntegrationTests(project: ProjectSpec): TestCase[] {
  const tests: TestCase[] = [];

  if (project.tests.integration === false) {
    return tests;
  }

  // API and Database integration
  if (project.api.type !== 'none' && project.entities.length > 0) {
    tests.push({
      name: 'Full API Flow - CRUD Operations',
      description: 'Test complete CRUD flow through API',
      steps: [
        'Create a resource via POST',
        'Read the created resource via GET',
        'Update the resource via PUT',
        'Verify update is persisted',
        'Delete the resource via DELETE',
        'Verify deletion is complete',
      ],
      expectedResult: 'All CRUD operations work correctly end-to-end',
    });
  }

  // Auth integration tests
  if (project.auth.enabled) {
    project.api.endpoints
      .filter((ep) => ep.authRequired)
      .forEach((endpoint) => {
        tests.push({
          name: `Protected Endpoint - ${endpoint.path}`,
          description: `Test authentication requirement on ${endpoint.path}`,
          steps: [
            `Attempt access to ${endpoint.path} without auth`,
            'Verify 401 response',
            'Attempt access with valid auth token',
            'Verify request succeeds',
          ],
          expectedResult: 'Protected endpoints correctly enforce authentication',
        });
      });
  }

  // Multi-entity integration tests
  if (project.entities.length > 1) {
    const entity1 = project.entities[0];
    const entity2 = project.entities[1];

    const relation = entity1.relations.find((r) => r.target === entity2.name);
    if (relation) {
      tests.push({
        name: `${entity1.name} - ${entity2.name} Relationship`,
        description: `Test relationship between ${entity1.name} and ${entity2.name}`,
        steps: [
          `Create a ${entity1.name}`,
          `Create a ${entity2.name}`,
          `Link ${entity2.name} to ${entity1.name}`,
          `Verify relationship is established`,
        ],
        expectedResult: `Relationship between ${entity1.name} and ${entity2.name} works correctly`,
      });
    }
  }

  return tests;
}

/**
 * Generate E2E test cases
 */
function generateE2eTests(project: ProjectSpec): TestCase[] {
  const tests: TestCase[] = [];

  if (project.tests.e2e === false || project.stack.type === 'backend') {
    return tests;
  }

  // User flow tests
  if (project.auth.enabled) {
    tests.push({
      name: 'User Registration and Login Flow',
      description: 'Complete user registration and authentication flow',
      steps: [
        'Navigate to registration page',
        'Fill out registration form',
        'Submit form',
        'Verify success message',
        'Navigate to login',
        'Enter credentials',
        'Verify dashboard is displayed',
      ],
      expectedResult: 'User can register and login successfully',
    });
  }

  // Feature workflows
  project.features.forEach((feature) => {
    tests.push({
      name: `Feature: ${feature.name}`,
      description: `Test complete ${feature.name} workflow`,
      steps: [
        `Navigate to ${feature.name} section`,
        `Perform primary action for ${feature.name}`,
        'Verify result is displayed',
      ],
      expectedResult: `${feature.name} feature works end-to-end`,
    });
  });

  // Main user journey
  if (project.features.length > 0) {
    tests.push({
      name: 'Main User Journey',
      description: 'Test complete user journey through application',
      steps: [
        'User enters application',
        'User completes onboarding (if applicable)',
        'User accesses primary features',
        'User completes main task flow',
      ],
      expectedResult: 'User can complete primary objectives without errors',
    });
  }

  return tests;
}

/**
 * Generate manual test cases and checklists
 */
function generateManualChecks(project: ProjectSpec): TestCase[] {
  const checks: TestCase[] = [];

  if (project.tests.manualChecklists === false) {
    return checks;
  }

  // Cross-browser compatibility
  checks.push({
    name: 'Cross-Browser Compatibility',
    description: 'Verify application works across different browsers',
    steps: [
      'Test on Chrome (latest)',
      'Test on Firefox (latest)',
      'Test on Safari (latest)',
      'Test on Edge (latest)',
      'Verify responsive design on mobile',
    ],
    expectedResult: 'Application works correctly on all major browsers and devices',
  });

  // Performance checks
  checks.push({
    name: 'Performance Baseline',
    description: 'Verify application performance meets baseline requirements',
    steps: [
      'Measure page load time',
      'Measure API response time',
      'Check memory usage',
      'Verify no console errors',
    ],
    expectedResult: 'Application meets performance requirements',
  });

  // Security checks
  if (project.auth.enabled) {
    checks.push({
      name: 'Security Audit',
      description: 'Manual security review of authentication and data handling',
      steps: [
        'Verify passwords are properly hashed',
        'Verify tokens expire correctly',
        'Test CSRF protection',
        'Verify XSS prevention',
        'Check SQL injection protection',
      ],
      expectedResult: 'Application follows security best practices',
    });
  }

  // Accessibility checks
  checks.push({
    name: 'Accessibility Review',
    description: 'Verify WCAG compliance and accessibility standards',
    steps: [
      'Test keyboard navigation',
      'Verify screen reader compatibility',
      'Check color contrast ratios',
      'Verify focus indicators',
    ],
    expectedResult: 'Application is accessible to all users',
  });

  // Data validation checks
  project.entities.forEach((entity) => {
    checks.push({
      name: `${entity.name} - Data Integrity`,
      description: `Manual verification of ${entity.name} data handling`,
      steps: [
        `Create multiple ${entity.name} records`,
        'Verify data is stored correctly',
        'Export data and verify format',
      ],
      expectedResult: `${entity.name} data integrity is maintained`,
    });
  });

  return checks;
}

/**
 * Get a summary of recommended tests
 */
export function getTestSummary(project: ProjectSpec): string {
  const plan = generateTestsPlan(project);
  const lines: string[] = [];

  lines.push('📋 Recommended Test Plan Summary\n');

  if (project.tests.unit && plan.unitTests.length > 0) {
    lines.push(`✅ Unit Tests: ${plan.unitTests.length} tests`);
  }

  if (project.tests.integration && plan.integrationTests.length > 0) {
    lines.push(`✅ Integration Tests: ${plan.integrationTests.length} tests`);
  }

  if (project.tests.e2e && plan.e2eTests.length > 0) {
    lines.push(`✅ End-to-End Tests: ${plan.e2eTests.length} tests`);
  }

  if (project.tests.manualChecklists && plan.manualChecks.length > 0) {
    lines.push(`✅ Manual Checks: ${plan.manualChecks.length} items`);
  }

  const total =
    plan.unitTests.length +
    plan.integrationTests.length +
    plan.e2eTests.length +
    plan.manualChecks.length;
  lines.push(`\nTotal Test Items: ${total}`);

  return lines.join('\n');
}
