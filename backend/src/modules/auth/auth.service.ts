import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { RegisterInput, LoginInput } from './auth.schema';
import { authRepository } from './auth.repository';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../shared/errors';

const JWT_SECRET: string = process.env.JWT_SECRET ?? (() => {
  throw new Error('JWT_SECRET não está definido. Defina a variável de ambiente JWT_SECRET para iniciar a aplicação.');
})();
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  async register(data: RegisterInput) {
    const existing = await authRepository.findByEmail(data.email);
    if (existing) {
      throw new ValidationError('Email já cadastrado');
    }

    const passwordHash = await hash(data.password, 10);

    const user = await authRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    const token = sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(data: LoginInput) {
    const { identifier, password } = data;

    // Try to find user by email first, then by username
    let user = await authRepository.findByEmail(identifier);

    if (!user) {
      user = await authRepository.findByUsername(identifier);
    }

    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    if (!user.active) {
      throw new UnauthorizedError('Usuário inativo');
    }

    const passwordMatch = await compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const token = sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      active: user.active,
    };
  }
}

export const authService = new AuthService();