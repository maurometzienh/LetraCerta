import { Collection, Entity, Enum, ManyToOne, type Opt, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { User } from './User.js';
import { DailyWord } from './DailyWord.js';
import { Attempt } from './Attempt.js';

export enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  WON = 'WON',
  LOST = 'LOST',
}

@Entity({ tableName: 'games' })
@Unique({ properties: ['user', 'dailyWord'] })
export class Game {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => DailyWord)
  dailyWord!: DailyWord;

  @Enum(() => GameStatus)
  status: GameStatus & Opt = GameStatus.IN_PROGRESS;

  @Property({ type: 'datetime' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'datetime', nullable: true })
  finishedAt?: Date;

  @OneToMany(() => Attempt, (attempt) => attempt.game)
  attempts = new Collection<Attempt>(this);
}
