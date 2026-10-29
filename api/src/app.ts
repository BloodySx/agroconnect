import dotenv from 'dotenv';

dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { registerAuthHooks } from './shared/auth';
import { registerOrderRoutes } from './modules/orders/routes';
import { registerProductRoutes } from './modules/products/routes';
import { registerPackageRoutes } from './modules/packages/routes';
import { registerProductPriceRoutes } from './modules/product-prices/routes';
import { registerAuthRoutes } from './modules/auth/routes';
import { registerAdminRoutes } from './modules/admin/routes';
import { AppError } from './shared/errors';
import { ZodError } from 'zod';

const app = Fastify({
  logger: {
    level: config.isProduction ? 'info' : 'debug',
  },
});

async function buildServer() {
    try {
        console.log('>>> BUILD SERVER STARTED');
        await app.register(helmet);
    const corsOrigin =
      config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',').map((value) => value.trim());
    await app.register(cors, {
      origin: corsOrigin,
    });
    await app.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    app.setErrorHandler((error: any, request, reply) => {
      const isProduction = config.isProduction;

      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          error: error.code,
          message: error.message,
        });
      }

      if (error instanceof ZodError) {
        const firstMessage = error.errors?.[0]?.message ?? 'Dados inválidos';
        return reply.status(400).send({
          error: 'BAD_REQUEST',
          message: firstMessage,
        });
      }

      const statusCode = typeof (error as { statusCode?: number }).statusCode === 'number'
        ? (error as { statusCode: number }).statusCode
        : 500;

      request.log.error(error);

      return reply.status(statusCode).send({
        error: 'INTERNAL_ERROR',
        message: isProduction ? 'Erro interno do servidor' : (error?.message ?? 'Erro interno do servidor'),
      });
    });

    await registerAuthHooks(app);

    app.get('/health', async () => {
      return { status: 'ok' };
    });

    await registerAuthRoutes(app);
    await registerProductRoutes(app);
    await registerPackageRoutes(app);
    await registerProductPriceRoutes(app);
    await registerOrderRoutes(app);
    await registerAdminRoutes(app);

    const port = config.port;
    await app.listen({ port, host: '0.0.0.0' });

    app.log.info(`Server running on port ${port} [${config.nodeEnv}]`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

export { app };

buildServer();