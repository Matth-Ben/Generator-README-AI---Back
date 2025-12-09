/**
 * Generate Route
 * POST /api/generate - Generate README from ProjectSpec
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ProjectSpec } from '../types/project';
import { buildReadme } from '../services/readmeBuilder';
import { detectConflicts } from '../services/conflictDetector';
import { storeResult } from './result';

// Simplified validation schema (full schema omitted for brevity)
const generateRequestSchema = z.object({
  meta: z.object({
    projectName: z.string().min(1),
    summary: z.string(),
  }),
  stack: z.object({
    type: z.enum(['frontend', 'backend', 'fullstack']),
  }),
});

export async function setupGenerateRoute(app: FastifyInstance) {
  app.post<{ Body: ProjectSpec }>(
    '/api/generate',
    async (request: FastifyRequest<{ Body: ProjectSpec }>, reply: FastifyReply) => {
      try {
        const project = request.body as ProjectSpec;

        // Log received payload for debugging
        app.log.info({
          msg: 'Generate request received',
          projectName: project?.meta?.projectName,
          hasProject: !!project,
          keys: Object.keys(project || {}),
        });

        // Validate required fields
        if (!project || !project.meta || !project.meta.projectName) {
          return reply.status(400).send({
            error: 'Project name is required',
            received: project ? Object.keys(project) : 'no payload',
          });
        }

        // Detect conflicts before generation
        const integrity = detectConflicts(project);

        // Generate README
        const readme = await buildReadme(project);

        // Store result for retrieval
        const id = `proj_${Date.now()}`;
        storeResult(id, readme);

        return reply.status(200).send({
          id,
          readme,
          integrity,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Generate error:', error);
        return reply.status(500).send({
          error: `Failed to generate README: ${message}`,
        });
      }
    }
  );
}
