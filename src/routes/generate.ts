/**
 * Generate Route
 * POST /api/generate - Generate README from ProjectSpec
 * 
 * Requires authentication via Firebase ID token in Authorization header
 * Saves generated README to Firestore under users/{uid}/markdowns
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ProjectSpec } from '../types/project';
import { buildReadme } from '../services/readmeBuilder';
import { detectConflicts } from '../services/conflictDetector';
import { storeResult } from './result';
import { verifyIdToken, saveMarkdownDocument } from '../services/firebaseAdmin';

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

        // Verify authentication token
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.status(401).send({
            error: 'Missing or invalid Authorization header',
            code: 'MISSING_AUTH',
          });
        }

        const token = authHeader.slice(7); // Remove "Bearer " prefix
        let userId: string;
        try {
          const decodedToken = await verifyIdToken(token);
          userId = decodedToken.uid;
        } catch (error) {
          return reply.status(401).send({
            error: 'Invalid or expired authentication token',
            code: 'INVALID_TOKEN',
          });
        }

        // Log received payload for debugging
        app.log.info({
          msg: 'Generate request received',
          projectName: project?.meta?.projectName,
          userId,
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

        // Save markdown to Firestore under users/{userId}/markdowns
        try {
          const markdownData = {
            title: project.meta.projectName,
            markdown: readme,
            projectName: project.meta.projectName,
            description: project.meta.summary || '',
            content: readme,
            updatedAt: new Date(), // Will be replaced by serverTimestamp in saveMarkdownDocument
          };

          const savedDoc = await saveMarkdownDocument(userId, markdownData, undefined, project);
          
          app.log.info({
            msg: 'Markdown saved to Firestore',
            docId: savedDoc.id,
            userId,
          });

          return reply.status(200).send({
            id,
            docId: savedDoc.id,
            readme,
            integrity,
          });
        } catch (firestoreError) {
          app.log.warn({
            msg: 'Failed to save markdown to Firestore, but returning result anyway',
            error: firestoreError instanceof Error ? firestoreError.message : 'Unknown error',
            userId,
          });

          // Still return success with the generated README
          // User can see it on /result page, even if not persisted
          return reply.status(200).send({
            id,
            readme,
            integrity,
            warning: 'README generated but not saved to database',
          });
        }
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
