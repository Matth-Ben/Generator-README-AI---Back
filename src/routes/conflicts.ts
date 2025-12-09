/**
 * Conflicts Route
 * POST /api/detect-conflicts - Detect conflicts in ProjectSpec
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProjectSpec } from '../types/project';
import { detectConflicts } from '../services/conflictDetector';

export async function setupConflictsRoute(app: FastifyInstance) {
  app.post<{ Body: ProjectSpec }>(
    '/api/detect-conflicts',
    async (request: FastifyRequest<{ Body: ProjectSpec }>, reply: FastifyReply) => {
      try {
        const project = request.body as ProjectSpec;

        const integrity = detectConflicts(project);

        return reply.status(200).send(integrity);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Conflict detection error:', error);
        return reply.status(500).send({
          error: `Failed to detect conflicts: ${message}`,
        });
      }
    }
  );
}
