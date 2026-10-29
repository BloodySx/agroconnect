import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const PLACEHOLDER_FRAGMENTS = [
  'CHANGE_ME',
  'change_in_production',
  'ssconnect_jwt_secret_change_in_production',
];

function fail(message: string): never {
  throw new Error(`[CONFIGURAÇÃO] ${message}`);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  fail('DATABASE_URL é obrigatória. Defina a string de conexão do banco de dados.');
}

const DIRECT_URL = process.env.DIRECT_URL;
if (!DIRECT_URL) {
  fail('DIRECT_URL é obrigatória. Ela é usada pelo Prisma para migrations (conexão direta, sem pooler).');
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  fail('JWT_SECRET é obrigatório. Defina um segredo forte e aleatório.');
}

if (isProduction) {
  if (JWT_SECRET.length < 32) {
    fail('JWT_SECRET muito curto para produção (mínimo de 32 caracteres).');
  }
  if (PLACEHOLDER_FRAGMENTS.some((fragment) => JWT_SECRET.includes(fragment))) {
    fail('JWT_SECRET não pode ser um valor de exemplo/placeholder em produção. Defina um segredo real e forte.');
  }
}

const CORS_ORIGIN = process.env.CORS_ORIGIN;
if (isProduction && !CORS_ORIGIN) {
  fail('CORS_ORIGIN é obrigatório em produção. Defina a origem do painel (ex: https://admin.exemplo.com).');
}

export const config = {
  nodeEnv: isProduction ? 'production' : 'development',
  isProduction,
  port: Number(process.env.PORT) || 3333,
  databaseUrl: DATABASE_URL,
  directUrl: DIRECT_URL,
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: isProduction ? (CORS_ORIGIN as string) : (CORS_ORIGIN || '*'),
};
