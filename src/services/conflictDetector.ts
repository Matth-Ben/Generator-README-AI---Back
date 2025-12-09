/**
 * Conflict Detector
 * Implements synchronous rule-based validation for ProjectSpec
 * Detects inconsistencies and provides suggestions
 */

import { ProjectSpec, Conflict, IntegrityResult } from '../types/project';

/**
 * Detect conflicts and inconsistencies in the project specification
 * @param project The project specification to validate
 * @returns Integrity result with conflicts, warnings, and suggestions
 */
export function detectConflicts(project: ProjectSpec): IntegrityResult {
  const conflicts: Conflict[] = [];
  const warnings: Conflict[] = [];
  const suggestions: Conflict[] = [];

  // Rule 1: Auth enabled but no roles defined
  if (project.auth.enabled && project.auth.roles.length === 0) {
    conflicts.push({
      type: 'error',
      code: 'AUTH_NO_ROLES',
      message: 'Authentication is enabled but no roles are defined',
      suggestion: 'Add at least one role (e.g., admin, user, guest)',
    });
  }

  // Rule 2: Auth methods but no password policy
  if (
    project.auth.enabled &&
    project.auth.methods.includes('email/password') &&
    !project.auth.security.passwordPolicy
  ) {
    suggestions.push({
      type: 'warning',
      code: 'AUTH_NO_POLICY',
      message: 'Email/password authentication enabled without password policy',
      suggestion:
        'Define a password policy (minimum length, complexity requirements, etc.)',
    });
  }

  // Rule 3: API without backend
  if (
    project.api.type !== 'none' &&
    project.stack.type === 'frontend'
  ) {
    warnings.push({
      type: 'warning',
      code: 'API_NO_BACKEND',
      message: 'API is configured but stack type is frontend-only',
      suggestion: 'Either change stack type to fullstack/backend or disable API',
    });
  }

  // Rule 4: Features but no entities
  if (project.features.length > 0 && project.entities.length === 0) {
    suggestions.push({
      type: 'warning',
      code: 'FEATURES_NO_ENTITIES',
      message: 'Features are defined but no entities exist',
      suggestion: 'Consider adding entities to support these features',
    });
  }

  // Rule 5: E2E tests without API
  if (project.tests.e2e && project.api.type === 'none') {
    suggestions.push({
      type: 'warning',
      code: 'E2E_NO_API',
      message: 'End-to-end tests are enabled but no API is configured',
      suggestion: 'Either add an API or disable E2E tests',
    });
  }

  // Rule 6: Multiple entities but no backend
  if (project.entities.length > 1 && project.stack.type === 'frontend') {
    warnings.push({
      type: 'warning',
      code: 'ENTITIES_NO_BACKEND',
      message: 'Multiple entities defined in frontend-only project',
      suggestion: 'Consider using a backend to manage these entities',
    });
  }

  // Rule 7: Relations without backend
  const hasRelations = project.entities.some((e) => e.relations.length > 0);
  if (hasRelations && project.stack.type === 'frontend') {
    warnings.push({
      type: 'warning',
      code: 'RELATIONS_NO_BACKEND',
      message: 'Entity relations defined in frontend-only project',
      suggestion: 'Add a backend to properly handle entity relationships',
    });
  }

  // Rule 8: Microservices without multiple services
  if (
    project.stack.architecture === 'microservices' &&
    project.entities.length < 2
  ) {
    suggestions.push({
      type: 'warning',
      code: 'MICROSERVICES_MINIMAL',
      message: 'Microservices architecture selected with minimal entities',
      suggestion:
        'Microservices may be overkill for projects with few entities. Consider using monolithic architecture.',
    });
  }

  // Rule 9: Database configured but always null in MVP
  if (project.stack.database.type !== null) {
    suggestions.push({
      type: 'warning',
      code: 'DATABASE_NOT_IMPLEMENTED',
      message: 'Database configuration detected but not yet supported in MVP',
      suggestion: 'Database features will be available in a future version',
    });
  }

  // Rule 10: Rate limiting without auth
  if (
    project.auth.security.rateLimiting &&
    !project.auth.enabled
  ) {
    suggestions.push({
      type: 'warning',
      code: 'RATE_LIMIT_NO_AUTH',
      message: 'Rate limiting enabled without authentication',
      suggestion:
        'Rate limiting is typically used to protect authenticated endpoints',
    });
  }

  // Rule 11: GraphQL without backend
  if (project.api.type === 'graphql' && project.stack.type === 'frontend') {
    conflicts.push({
      type: 'error',
      code: 'GRAPHQL_NO_BACKEND',
      message: 'GraphQL API requires a backend',
      suggestion: 'Change stack type to include a backend',
    });
  }

  // Rule 12: No tests with deployment enabled
  if (
    !project.tests.unit &&
    !project.tests.integration &&
    !project.tests.e2e &&
    project.deployment.ci.enabled
  ) {
    suggestions.push({
      type: 'warning',
      code: 'NO_TESTS_WITH_CI',
      message: 'CI/CD pipeline enabled but no automated tests configured',
      suggestion: 'Enable at least unit tests for CI/CD pipeline',
    });
  }

  return {
    conflicts,
    warnings,
    suggestions,
  };
}

/**
 * Check if the project is valid (no critical conflicts)
 * @param project The project specification to validate
 * @returns true if no critical conflicts exist
 */
export function isValid(project: ProjectSpec): boolean {
  const result = detectConflicts(project);
  return result.conflicts.length === 0;
}

/**
 * Get all issues (conflicts + warnings) as a flat array
 * @param project The project specification to validate
 * @returns Array of all issues
 */
export function getAllIssues(project: ProjectSpec): Conflict[] {
  const result = detectConflicts(project);
  return [...result.conflicts, ...result.warnings];
}

/**
 * Get a human-readable summary of issues
 * @param project The project specification to validate
 * @returns String summary of issues
 */
export function getSummary(project: ProjectSpec): string {
  const result = detectConflicts(project);
  const lines: string[] = [];

  if (result.conflicts.length > 0) {
    lines.push(`❌ Errors (${result.conflicts.length}):`);
    result.conflicts.forEach((c) => {
      lines.push(`  - ${c.message}`);
      if (c.suggestion) {
        lines.push(`    💡 ${c.suggestion}`);
      }
    });
  }

  if (result.warnings.length > 0) {
    lines.push(`⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach((w) => {
      lines.push(`  - ${w.message}`);
      if (w.suggestion) {
        lines.push(`    💡 ${w.suggestion}`);
      }
    });
  }

  if (result.suggestions.length > 0) {
    lines.push(`💡 Suggestions (${result.suggestions.length}):`);
    result.suggestions.forEach((s) => {
      lines.push(`  - ${s.message}`);
      if (s.suggestion) {
        lines.push(`    → ${s.suggestion}`);
      }
    });
  }

  if (lines.length === 0) {
    return '✅ No issues detected!';
  }

  return lines.join('\n');
}
