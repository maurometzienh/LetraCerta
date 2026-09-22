import { Collection, Entity, Enum, ManyToOne, type Opt, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { User } from './User.js';
import { DailyWord } from './DailyWord.js';
import { Word } from './Word.js';
import { Attempt } from './Attempt.js';

export enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  WON = 'WON',
  LOST = 'LOST',
}

export enum GameMode {
  DAILY = 'DAILY',
  RANDOM = 'RANDOM',
}

@Entity({ tableName: 'games' })
@Unique({ properties: ['user', 'dailyWord'] })
export class Game {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Enum(() => GameMode)
  mode: GameMode & Opt = GameMode.DAILY;

  /** Preenchido apenas para partidas do modo DAILY (garante uma partida por usuário/dia). */
  @ManyToOne(() => DailyWord, { nullable: true })
  dailyWord?: DailyWord;

  /** Palavra secreta desta partida (preenchida em ambos os modos). */
  @ManyToOne(() => Word, { nullable: true })
  word?: Word;

  @Enum(() => GameStatus)
  status: GameStatus & Opt = GameStatus.IN_PROGRESS;

  @Property({ type: 'datetime' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'datetime', nullable: true })
  finishedAt?: Date;

  @OneToMany(() => Attempt, (attempt) => attempt.game)
  attempts = new Collection<Attempt>(this);
}
