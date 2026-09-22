import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import { User } from '../domain/entities/User.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const TOKEN_EXPIRATION = '7d';

export interface AuthResult {
  token: string;
  user: { id: number; username: string; email: string };
}

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(username: string, email: string, password: string): Promise<AuthResult> {
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError('E-mail já cadastrado.');
    }
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new ConflictError('Nome de usuário já em uso.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ username, email, passwordHash });
    await this.userRepository.flush();

    return this.buildAuthResult(user);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('E-mail ou senha inválidos.');
    }

    return this.buildAuthResult(user);
  }

  verifyToken(token: string): { userId: number } {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (typeof payload === 'string' || typeof payload.sub !== 'string') {
        throw new Error('Payload inválido.');
      }
      return { userId: Number(payload.sub) };
    } catch {
      throw new UnauthorizedError('Token inválido ou expirado.');
    }
  }

  private buildAuthResult(user: User): AuthResult {
    const token = jwt.sign({ sub: String(user.id) }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
    return {
      token,
      user: { id: user.id, username: user.username, email: user.email },
    };
  }
}
