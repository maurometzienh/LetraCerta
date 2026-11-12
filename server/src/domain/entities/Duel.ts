import { Entity, Enum, ManyToOne, type Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './User.js';
import { Word } from './Word.js';

export enum DuelStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

@Entity({ tableName: 'duels' })
export class Duel {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => User)
  challenger!: User;

  @ManyToOne(() => User)
  opponent!: User;

  @ManyToOne(() => Word)
  word!: Word;

  @Enum(() => DuelStatus)
  status: DuelStatus & Opt = DuelStatus.PENDING;

  @ManyToOne(() => User, { nullable: true })
  winner?: User;

  @Property({ type: 'datetime' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'datetime', nullable: true })
  finishedAt?: Date;
}
