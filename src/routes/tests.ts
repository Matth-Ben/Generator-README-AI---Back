/**
 * Tests Route
 * POST /api/tests-plan - Generate test plan from ProjectSpec
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProjectSpec } from '../types/project';
import { generateTestsPlan } from '../services/testsPlanner';

export async function setupTestsRoute(app: FastifyInstance) {
  app.post<{ Body: ProjectSpec }>(
    '/api/tests-plan',
    async (request: FastifyRequest<{ Body: ProjectSpec }>, reply: FastifyReply) => {
      try {
        const project = request.body as ProjectSpec;

        const testsPlan = generateTestsPlan(project);

        return reply.status(200).send(testsPlan);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Tests plan generation error:', error);
        return reply.status(500).send({
          error: `Failed to generate test plan: ${message}`,
        });
      }
    }
  );
}
