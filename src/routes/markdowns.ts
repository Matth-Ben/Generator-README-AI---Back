/**
 * Markdown API Routes
 * Handles CRUD operations for user markdown documents
 * All routes require authentication via Firebase ID token
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import {
  verifyIdToken,
  saveMarkdownDocument,
  getMarkdownDocument,
  listMarkdownDocuments,
  updateMarkdownDocument,
  deleteMarkdownDocument,
} from '../services/firebaseAdmin';

declare global {
  namespace Express {
    interface Request {
      user?: { uid: string; email?: string };
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: { uid: string; email?: string };
  }
}

/**
 * Middleware to verify Firebase token in Authorization header
 * Required for all markdown routes
 */
async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Missing or invalid Authorization header',
        code: 'MISSING_AUTH',
      });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    const decodedToken = await verifyIdToken(token);
    (request as any).user = { uid: decodedToken.uid, email: decodedToken.email };
  } catch (error) {
    return reply.code(401).send({
      error: 'Invalid authentication token',
      code: 'INVALID_TOKEN',
    });
  }
}

/**
 * Setup markdown routes
 * POST /api/markdowns - Create new markdown document
 * GET /api/markdowns - List all user's markdowns
 * GET /api/markdowns/:id - Get specific markdown
 * DELETE /api/markdowns/:id - Delete markdown
 */
export async function setupMarkdownRoutes(fastify: FastifyInstance) {
  // Create a sub-router for markdown routes with auth middleware
  const markdownRouter = async (fastify: FastifyInstance) => {
    // Register auth hook ONLY for routes in this router
    fastify.addHook('preHandler', verifyAuth);

    /**
     * POST /api/markdowns
     * Save a new README markdown document
   * 
   * Request body:
   * {
   *   title: string;
   *   markdown: string;
   *   projectName: string;
   * }
   */
  fastify.post('/api/markdowns', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { title, markdown, projectName } = request.body as {
        title: string;
        markdown: string;
        projectName: string;
      };

      if (!(request as any).user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      if (!title || !markdown) {
        return reply.code(400).send({
          error: 'title and markdown are required',
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await saveMarkdownDocument((request as any).user.uid, {
        title,
        markdown,
        projectName: projectName || title,
        updatedAt: new Date(),
      });

      return reply.code(201).send({
        success: true,
        data: result,
        message: 'Markdown saved successfully',
      });
    } catch (error) {
      console.error('Error saving markdown:', error);
      return reply.code(500).send({
        error: 'Failed to save markdown',
        code: 'SAVE_ERROR',
      });
    }
  });

  /**
   * GET /api/markdowns
   * List all markdown documents for the authenticated user
   */
  fastify.get('/api/markdowns', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!(request as any).user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const markdowns = await listMarkdownDocuments((request as any).user.uid);

      return reply.code(200).send({
        success: true,
        data: markdowns,
        total: markdowns.length,
      });
    } catch (error) {
      console.error('Error listing markdowns:', error);
      return reply.code(500).send({
        error: 'Failed to list markdowns',
        code: 'LIST_ERROR',
      });
    }
  });

  /**
   * GET /api/markdowns/:id
   * Get a specific markdown document
   */
  fastify.get(
    '/api/markdowns/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };

        if (!(request as any).user) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const markdown = await getMarkdownDocument((request as any).user.uid, id);

        if (!markdown) {
          return reply.code(404).send({
            error: 'Markdown document not found',
            code: 'NOT_FOUND',
          });
        }

        return reply.code(200).send({
          success: true,
          data: markdown,
        });
      } catch (error) {
        console.error('Error getting markdown:', error);
        return reply.code(500).send({
          error: 'Failed to get markdown',
          code: 'GET_ERROR',
        });
      }
    }
  );

  /**
   * PUT /api/markdowns/:id
   * Update a markdown document
   */
  fastify.put(
    '/api/markdowns/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const { projectName, description, markdown, content } = request.body as {
          projectName?: string;
          description?: string;
          markdown?: string;
          content?: string;
        };

        if (!(request as any).user) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        // Verify document exists and belongs to user
        const existingMarkdown = await getMarkdownDocument((request as any).user.uid, id);
        if (!existingMarkdown) {
          return reply.code(404).send({
            error: 'Markdown document not found',
            code: 'NOT_FOUND',
          });
        }

        // Update with provided fields (only non-undefined values)
        const updateData: any = {};
        if (projectName !== undefined) updateData.projectName = projectName;
        if (description !== undefined) updateData.description = description;
        if (markdown !== undefined) updateData.markdown = markdown;
        if (content !== undefined) updateData.content = content;

        if (Object.keys(updateData).length === 0) {
          return reply.code(400).send({
            error: 'No fields to update',
            code: 'VALIDATION_ERROR',
          });
        }

        const result = await updateMarkdownDocument((request as any).user.uid, id, updateData);

        return reply.code(200).send({
          success: true,
          message: 'Markdown updated successfully',
          data: result,
        });
      } catch (error) {
        console.error('Error updating markdown:', error);
        return reply.code(500).send({
          error: 'Failed to update markdown',
          code: 'UPDATE_ERROR',
        });
      }
    }
  );

  /**
   * GET /api/markdowns/:id/spec
   * Get the ProjectSpec for editing a markdown document
   */
  fastify.get(
    '/api/markdowns/:id/spec',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };

        if (!(request as any).user) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        const markdown = await getMarkdownDocument((request as any).user.uid, id);

        if (!markdown) {
          return reply.code(404).send({
            error: 'Markdown document not found',
            code: 'NOT_FOUND',
          });
        }

        // Check if projectSpec exists
        if (!(markdown as any).projectSpec) {
          return reply.code(400).send({
            error: 'This markdown does not have a project specification. It may have been created before this feature was available.',
            code: 'NO_SPEC',
            note: 'You can still edit the markdown content directly, but editing steps are not available.',
          });
        }

        return reply.code(200).send({
          success: true,
          data: (markdown as any).projectSpec,
        });
      } catch (error) {
        console.error('Error getting project spec:', error);
        return reply.code(500).send({
          error: 'Failed to get project specification',
          code: 'SPEC_ERROR',
        });
      }
    }
  );

  /**
   * DELETE /api/markdowns/:id
   * Delete a markdown document
   */
  fastify.delete(
    '/api/markdowns/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };

        if (!(request as any).user) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }

        // Verify document exists and belongs to user
        const markdown = await getMarkdownDocument((request as any).user.uid, id);
        if (!markdown) {
          return reply.code(404).send({
            error: 'Markdown document not found',
            code: 'NOT_FOUND',
          });
        }

        await deleteMarkdownDocument((request as any).user.uid, id);

        return reply.code(200).send({
          success: true,
          message: 'Markdown deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting markdown:', error);
        return reply.code(500).send({
          error: 'Failed to delete markdown',
          code: 'DELETE_ERROR',
        });
      }
    }
  );
  };

  // Register the markdown router with prefix
  await fastify.register(markdownRouter, { prefix: '' });
}
