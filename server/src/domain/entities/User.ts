import { Collection, Entity, OneToMany, type Opt, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Game } from './Game.js';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string' })
  @Unique()
  username!: string;

  @Property({ type: 'string' })
  @Unique()
  email!: string;

  @Property({ type: 'string', hidden: true })
  passwordHash!: string;

  @Property({ type: 'datetime' })
  createdAt: Date & Opt = new Date();

  @OneToMany(() => Game, (game) => game.user)
  games = new Collection<Game>(this);
}
