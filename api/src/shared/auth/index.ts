import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verify } from 'jsonwebtoken';
import prisma from '../../database/prisma';

const JWT_SECRET: string = process.env.JWT_SECRET ?? (() => {
  throw new Error('JWT_SECRET não está definido. Defina a variável de ambiente JWT_SECRET para iniciar a aplicação.');
})();

type SessionUser = {
  id: string;
  email: string | null;
  role: 'USER' | 'ADMIN';
  active: boolean;
};

type FindSessionUser = (id: string) => Promise<SessionUser | null>;

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      sub: string;
      email: string | null;
      role: 'USER' | 'ADMIN';
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorizeAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Reconsulta o usuário em toda requisição autenticada: bloqueio, exclusão e mudança
// de papel devem valer imediatamente, mesmo com JWT antigo ainda não expirado.
// O parâmetro injetável permite testar a autorização sem usar o banco de produção.
export function buildAuthenticate(findSessionUser: FindSessionUser) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.status(401).send({ message: 'Token não fornecido' });
      return;
    }

    let userId: string;
    try {
      const decoded = verify(authHeader.substring(7), JWT_SECRET, { algorithms: ['HS256'] });
      if (typeof decoded === 'string' || typeof decoded.sub !== 'string' || !decoded.sub) {
        reply.status(401).send({ message: 'Token inválido ou expirado' });
        return;
      }
      userId = decoded.sub;
    } catch {
      reply.status(401).send({ message: 'Token inválido ou expirado' });
      return;
    }

    // Erros de conexão com o banco devem propagar como erro do servidor, não como
    // credenciais inválidas nem como autorização concedida.
    const currentUser = await findSessionUser(userId);
    if (!currentUser || !currentUser.active) {
      reply.status(401).send({ message: 'Conta desativada ou indisponível' });
      return;
    }

    // Não confiar na role ou no e-mail antigo embutidos no JWT.
    request.user = {
      sub: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
    };
  };
}

// Usar após app.authenticate no preHandler. Não decodificar o token duas vezes.
export async function authorizeAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.user) {
    reply.status(401).send({ message: 'Não autenticado' });
    return;
  }
  if (request.user.role !== 'ADMIN') {
    reply.status(403).send({ message: 'Acesso negado: permissão administrativa necessária' });
  }
}

export function registerAuthHooks(app: FastifyInstance) {
  app.decorate('authenticate', buildAuthenticate(async (id) => {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, active: true },
    });
  }));
  app.decorate('authorizeAdmin', authorizeAdmin);
}
