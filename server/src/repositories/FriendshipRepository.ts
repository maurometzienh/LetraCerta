import type { EntityManager } from '@mikro-orm/postgresql';
import { Friendship, FriendshipStatus } from '../domain/entities/Friendship.js';
import { User } from '../domain/entities/User.js';

export class FriendshipRepository {
  constructor(private readonly em: EntityManager) {}

  findById(id: number): Promise<Friendship | null> {
    return this.em.findOne(Friendship, { id }, { populate: ['requester', 'addressee'] });
  }

  /** Busca o vínculo entre dois usuários, em qualquer direção (quem pediu/quem recebeu). */
  findBetween(userA: User, userB: User): Promise<Friendship | null> {
    return this.em.findOne(Friendship, {
      $or: [
        { requester: userA, addressee: userB },
        { requester: userB, addressee: userA },
      ],
    });
  }

  findAcceptedForUser(user: User): Promise<Friendship[]> {
    return this.em.find(
      Friendship,
      { status: FriendshipStatus.ACCEPTED, $or: [{ requester: user }, { addressee: user }] },
      { populate: ['requester', 'addressee'], orderBy: { respondedAt: 'DESC' } },
    );
  }

  findIncomingPending(user: User): Promise<Friendship[]> {
    return this.em.find(
      Friendship,
      { addressee: user, status: FriendshipStatus.PENDING },
      { populate: ['requester'], orderBy: { createdAt: 'DESC' } },
    );
  }

  create(requester: User, addressee: User): Friendship {
    const friendship = this.em.create(Friendship, { requester, addressee });
    this.em.persist(friendship);
    return friendship;
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
