import { Entity, ManyToOne, type Opt, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Word } from './Word.js';

@Entity({ tableName: 'daily_words' })
export class DailyWord {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string', columnType: 'date' })
  @Unique()
  date!: string;

  @ManyToOne(() => Word)
  word!: Word;

  @Property({ type: 'datetime' })
  createdAt: Date & Opt = new Date();
}
