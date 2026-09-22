import type { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../domain/entities/User.js';

export class UserRepository {
  constructor(private readonly em: EntityManager) {}

  findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.em.findOne(User, { username });
  }

  findById(id: number): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  create(data: { username: string; email: string; passwordHash: string }): User {
    const user = this.em.create(User, data);
    this.em.persist(user);
    return user;
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
