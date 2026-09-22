import { Entity, ManyToOne, type Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { Game } from './Game.js';

@Entity({ tableName: 'attempts' })
export class Attempt {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => Game)
  game!: Game;

  @Property({ type: 'number' })
  attemptNumber!: number;

  @Property({ type: 'string', length: 5 })
  guess!: string;

  @Property({ type: 'json' })
  result!: string[]; // 'correct' | 'present' | 'absent' por letra

  @Property({ type: 'datetime' })
  createdAt: Date & Opt = new Date();
}
