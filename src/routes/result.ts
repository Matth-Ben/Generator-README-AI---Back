/**
 * Result Route
 * GET /api/result/:id - Retrieve generated README by project ID
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// In-memory storage for generated results (simple, session-based)
// In production, use a database
interface StoredResult {
  id: string;
  readme: string;
  timestamp: number;
}

const resultStorage: Map<string, StoredResult> = new Map();

// Cleanup old results (older than 24 hours)
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [id, result] of resultStorage.entries()) {
    if (now - result.timestamp > maxAge) {
      resultStorage.delete(id);
    }
  }
}, 60 * 60 * 1000); // Run cleanup every hour

export function storeResult(id: string, readme: string): void {
  resultStorage.set(id, {
    id,
    readme,
    timestamp: Date.now(),
  });
}

export async function setupResultRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    '/api/result/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;

        app.log.info({
          msg: 'Result request received',
          id,
          storageSize: resultStorage.size,
        });

        // Check if result exists
        const result = resultStorage.get(id);

        if (!result) {
          return reply.status(404).send({
            error: 'Result not found',
            id,
            availableIds: Array.from(resultStorage.keys()),
          });
        }

        return reply.status(200).send({
          id: result.id,
          readme: result.readme,
          timestamp: result.timestamp,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        app.log.error({
          msg: 'Result route error',
          error: message,
        });

        return reply.status(500).send({
          error: 'Failed to retrieve result',
          message,
        });
      }
    }
  );
}
