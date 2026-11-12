import type { EntityManager } from '@mikro-orm/postgresql';
import { Duel, DuelStatus } from '../domain/entities/Duel.js';
import { User } from '../domain/entities/User.js';
import { Word } from '../domain/entities/Word.js';

export class DuelRepository {
  constructor(private readonly em: EntityManager) {}

  findById(id: number): Promise<Duel | null> {
    return this.em.findOne(Duel, { id }, { populate: ['challenger', 'opponent', 'word', 'winner'] });
  }

  findPendingInvitesForUser(user: User): Promise<Duel[]> {
    return this.em.find(
      Duel,
      { opponent: user, status: DuelStatus.PENDING },
      { populate: ['challenger'], orderBy: { createdAt: 'DESC' } },
    );
  }

  /** Duelo mais recente ainda não finalizado em que o usuário participa (desafiante ou desafiado). */
  findActiveForUser(user: User): Promise<Duel | null> {
    return this.em.findOne(
      Duel,
      {
        status: { $in: [DuelStatus.PENDING, DuelStatus.IN_PROGRESS] },
        $or: [{ challenger: user }, { opponent: user }],
      },
      { populate: ['challenger', 'opponent'], orderBy: { createdAt: 'DESC' } },
    );
  }

  create(challenger: User, opponent: User, word: Word): Duel {
    const duel = this.em.create(Duel, { challenger, opponent, word });
    this.em.persist(duel);
    return duel;
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
