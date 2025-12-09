/**
 * Main Backend Server
 * Fastify server with routes for README generation, conflict detection, and test planning
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { setupGenerateRoute } from './routes/generate';
import { setupResultRoute } from './routes/result';
import { setupConflictsRoute } from './routes/conflicts';
import { setupTestsRoute } from './routes/tests';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';

/**
 * Initialize and start the server
 */
async function start() {
  const fastify = Fastify({
    logger: true,
  });

  // Register CORS plugin
  await fastify.register(cors, {
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Health check route
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API info route
  fastify.get('/api/info', async (request, reply) => {
    return {
      name: 'Generator README AI - Backend',
      version: '1.0.0',
      endpoints: [
        'POST /api/generate',
        'GET /api/result/:id',
        'POST /api/detect-conflicts',
        'POST /api/tests-plan',
      ],
    };
  });

  // Setup routes
  await setupGenerateRoute(fastify);
  await setupResultRoute(fastify);
  await setupConflictsRoute(fastify);
  await setupTestsRoute(fastify);

  // Start server
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`✅ Server running at http://${HOST}:${PORT}`);
    console.log(`📝 API Documentation available at http://${HOST}:${PORT}/api/info`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
