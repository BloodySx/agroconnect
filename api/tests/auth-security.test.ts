import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { sign } from 'jsonwebtoken';

// Apenas variáveis de teste. O Prisma Client pode ser importado, mas nenhum
// teste abaixo se conecta a um PostgreSQL real ou altera dados.
const TEST_SECRET = 'ssconnect-security-test-key-not-for-production-123456';
process.env.JWT_SECRET = TEST_SECRET;
process.env.DATABASE_URL = 'postgresql://ci:ci@127.0.0.1:5432/ssconnect_ci';
process.env.DIRECT_URL = process.env.DATABASE_URL;

type Account = {
  id: string;
  email: string | null;
  role: 'USER' | 'ADMIN';
  active: boolean;
};

const accountId = '11111111-1111-4111-8111-111111111111';

function tokenFor(role: 'USER' | 'ADMIN') {
  return sign(
    { sub: accountId, email: 'cliente@example.invalid', role },
    TEST_SECRET,
    { expiresIn: '1h', algorithm: 'HS256' },
  );
}

test('auth/register não existe; login continua disponível', async () => {
  const { registerAuthRoutes } = await import('../src/modules/auth/routes');
  const app = Fastify({ logger: false });
  app.decorate('authenticate', async () => undefined);
  app.register(registerAuthRoutes);

  try {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { name: 'Novo', email: 'novo@example.invalid', password: '12345678' },
    });
    assert.equal(response.statusCode, 404);
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {},
    });
    assert.equal(loginResponse.statusCode, 400);
  } finally {
    await app.close();
  }
});

test('JWT válido exige conta existente e ativa no banco', async () => {
  const { buildAuthenticate, authorizeAdmin } = await import('../src/shared/auth');
  let currentUser: Account | null = {
    id: accountId, email: 'cliente@example.invalid', role: 'USER', active: true,
  };
  let failQuery = false;
  let lookupCalls = 0;

  const app = Fastify({ logger: false });
  app.decorate('authenticate', buildAuthenticate(async (id) => {
    lookupCalls += 1;
    assert.equal(id, accountId);
    if (failQuery) throw new Error('Simulated database failure');
    return currentUser;
  }));
  app.decorate('authorizeAdmin', authorizeAdmin);
  app.get('/protected', { preHandler: [app.authenticate] }, async (req) => ({
    id: req.user?.sub, role: req.user?.role,
  }));
  app.get('/admin-check', { preHandler: [app.authenticate, app.authorizeAdmin] }, async () => ({ ok: true }));

  const jwtUser = tokenFor('USER');
  const jwtAdmin = tokenFor('ADMIN');

  try {
    // Sem token ou com assinatura inválida, não se consulta o banco.
    let res = await app.inject({ url: '/protected' });
    assert.equal(res.statusCode, 401);
    res = await app.inject({ url: '/protected', headers: { authorization: 'Bearer invalid.token' } });
    assert.equal(res.statusCode, 401);
    assert.equal(lookupCalls, 0);

    // Cliente ativo acessa normalmente.
    res = await app.inject({ url: '/protected', headers: { authorization: 'Bearer ' + jwtUser } });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().role, 'USER');

    // Desativação ou exclusão revoga o acesso mesmo com JWT não expirado.
    currentUser = { ...currentUser!, active: false };
    res = await app.inject({ url: '/protected', headers: { authorization: 'Bearer ' + jwtUser } });
    assert.equal(res.statusCode, 401);
    currentUser = null;
    res = await app.inject({ url: '/protected', headers: { authorization: 'Bearer ' + jwtUser } });
    assert.equal(res.statusCode, 401);

    // Um token que diz ADMIN não mantém permissão após rebaixamento.
    currentUser = { id: accountId, email: null, role: 'USER', active: true };
    res = await app.inject({ url: '/admin-check', headers: { authorization: 'Bearer ' + jwtAdmin } });
    assert.equal(res.statusCode, 403);

    // O papel atualizado no banco decide a autorização.
    currentUser = { ...currentUser, role: 'ADMIN' };
    res = await app.inject({ url: '/admin-check', headers: { authorization: 'Bearer ' + jwtUser } });
    assert.equal(res.statusCode, 200);

    // Falha do banco nunca deve ser tratada como login autorizado.
    failQuery = true;
    res = await app.inject({ url: '/protected', headers: { authorization: 'Bearer ' + jwtUser } });
    assert.equal(res.statusCode, 500);
  } finally {
    await app.close();
  }
});

test('rota real de cadastro administrativo rejeita clientes e visitantes', async () => {
  const { buildAuthenticate, authorizeAdmin } = await import('../src/shared/auth');
  const { registerAdminUserRoutes } = await import('../src/modules/admin/users/routes');
  let currentUser: Account = {
    id: accountId, email: 'cliente@example.invalid', role: 'USER', active: true,
  };

  const app = Fastify({ logger: false });
  app.decorate('authenticate', buildAuthenticate(async () => currentUser));
  app.decorate('authorizeAdmin', authorizeAdmin);
  app.register(registerAdminUserRoutes);

  const payload = {
    name: 'Cliente de teste', username: 'cliente_teste', password: '12345678',
    role: 'USER', active: true,
  };

  try {
    let res = await app.inject({ method: 'POST', url: '/admin/users', payload });
    assert.equal(res.statusCode, 401);

    res = await app.inject({
      method: 'POST', url: '/admin/users', payload,
      headers: { authorization: 'Bearer ' + tokenFor('USER') },
    });
    assert.equal(res.statusCode, 403);

    // Admin autenticado chega à validação de dados, mas não grava cliente
    // porque a requisição é intencionalmente inválida.
    currentUser = { ...currentUser, role: 'ADMIN' };
    res = await app.inject({
      method: 'POST', url: '/admin/users', payload: {},
      headers: { authorization: 'Bearer ' + tokenFor('ADMIN') },
    });
    assert.equal(res.statusCode, 400);
  } finally {
    await app.close();
  }
});
