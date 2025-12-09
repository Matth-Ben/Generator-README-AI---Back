/**
 * ConflictDetector Tests
 */

import {
  detectConflicts,
  isValid,
  getAllIssues,
} from '../src/services/conflictDetector';
import { ProjectSpec, defaultProject } from '../src/types/project';

describe('ConflictDetector', () => {
  describe('Auth without roles', () => {
    it('should detect error when auth enabled but no roles', () => {
      const project: ProjectSpec = {
        ...defaultProject,
        auth: {
          ...defaultProject.auth,
          enabled: true,
          roles: [],
        },
      };

      const result = detectConflicts(project);
      const conflict = result.conflicts.find((c) => c.code === 'AUTH_NO_ROLES');

      expect(conflict).toBeDefined();
      expect(conflict?.type).toBe('error');
    });

    it('should not report error when roles are defined', () => {
      const project: ProjectSpec = {
        ...defaultProject,
        auth: {
          ...defaultProject.auth,
          enabled: true,
          roles: ['admin', 'user'],
        },
      };

      const result = detectConflicts(project);
      const conflict = result.conflicts.find((c) => c.code === 'AUTH_NO_ROLES');

      expect(conflict).toBeUndefined();
    });
  });

  describe('API without backend', () => {
    it('should warn when API configured but no backend', () => {
      const project: ProjectSpec = {
        ...defaultProject,
        stack: {
          ...defaultProject.stack,
          type: 'frontend',
        },
        api: {
          ...defaultProject.api,
          type: 'rest',
        },
      };

      const result = detectConflicts(project);
      const warning = result.warnings.find((w) => w.code === 'API_NO_BACKEND');

      expect(warning).toBeDefined();
      expect(warning?.type).toBe('warning');
    });
  });

  describe('Features without entities', () => {
    it('should suggest entities when features exist', () => {
      const project: ProjectSpec = {
        ...defaultProject,
        features: [
          {
            id: 'f1',
            name: 'User Management',
            description: 'Manage users',
            entities: [],
            dependencies: [],
            settings: {},
          },
        ],
        entities: [],
      };

      const result = detectConflicts(project);
      const suggestion = result.suggestions.find(
        (s) => s.code === 'FEATURES_NO_ENTITIES'
      );

      expect(suggestion).toBeDefined();
    });
  });

  describe('E2E tests without API', () => {
    it('should suggest API when E2E tests enabled without API', () => {
      const project: ProjectSpec = {
        ...defaultProject,
        tests: {
          ...defaultProject.tests,
          e2e: true,
        },
        api: {
          ...defaultProject.api,
          type: 'none',
        },
      };

      const result = detectConflicts(project);
      const suggestion = result.suggestions.find((s) => s.code === 'E2E_NO_API');

      expect(suggestion).toBeDefined();
    });
  });

  describe('isValid function', () => {
    it('should return true for valid project', () => {
      const project: ProjectSpec = {
        ...defaultProject,
        stack: {
          ...defaultProject.stack,
          type: 'fullstack',
        },
        auth: {
          ...defaultProject.auth,
          enabled: false,
        },
      };

      expect(isValid(project)).toBe(true);
    });

    it('should return false when conflicts exist', () => {
      const project: ProjectSpec = {
        ...defaultProject,
        auth: {
          ...defaultProject.auth,
          enabled: true,
          roles: [],
        },
      };

      expect(isValid(project)).toBe(false);
    });
  });

  describe('getAllIssues function', () => {
    it('should return all conflicts and warnings', () => {
      const project: ProjectSpec = {
        ...defaultProject,
        auth: {
          ...defaultProject.auth,
          enabled: true,
          roles: [],
        },
        stack: {
          ...defaultProject.stack,
          type: 'frontend',
        },
        api: {
          ...defaultProject.api,
          type: 'rest',
        },
      };

      const issues = getAllIssues(project);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((i) => i.code === 'AUTH_NO_ROLES')).toBe(true);
    });
  });
});
