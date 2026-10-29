import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verify } from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET ?? (() => {
  throw new Error('JWT_SECRET não está definido. Defina a variável de ambiente JWT_SECRET para iniciar a aplicação.');
})();

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      sub: string;
      email: string;
      role: string;
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorizeAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ message: 'Token não fornecido' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = verify(token, JWT_SECRET) as unknown as { sub: string; email: string; role: string };
    request.user = decoded;
  } catch {
    return reply.status(401).send({ message: 'Token inválido ou expirado' });
  }
}

export async function authorizeAdmin(request: FastifyRequest, reply: FastifyReply) {
  const authResult = await authenticate(request, reply);
  if (authResult) return authResult;

  if (request.user?.role !== 'ADMIN') {
    return reply.status(403).send({ message: 'Acesso negado: permissão administrativa necessária' });
  }
}

export function registerAuthHooks(app: FastifyInstance) {
  app.decorate('authenticate', authenticate);
  app.decorate('authorizeAdmin', authorizeAdmin);
}
