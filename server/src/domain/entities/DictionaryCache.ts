import { Entity, type Opt, PrimaryKey, Property, Unique } from '@mikro-orm/core';

/** Cache local do resultado da consulta ao dicionário externo, por palavra. */
@Entity({ tableName: 'dictionary_cache' })
export class DictionaryCache {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @Property({ type: 'string', length: 20 })
  @Unique()
  word!: string;

  @Property({ type: 'boolean' })
  isValid!: boolean;

  @Property({ type: 'datetime' })
  checkedAt: Date & Opt = new Date();
}
