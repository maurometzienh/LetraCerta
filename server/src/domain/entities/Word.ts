import { Entity, type Opt, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'words' })
export class Word {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string', length: 5 })
  @Unique()
  text!: string;

  @Property({ type: 'boolean' })
  used: boolean & Opt = false;

  @Property({ type: 'datetime' })
  createdAt: Date & Opt = new Date();
}
