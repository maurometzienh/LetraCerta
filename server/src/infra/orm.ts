import { MikroORM } from '@mikro-orm/postgresql';
import config from './mikro-orm.config.js';

let orm: MikroORM;

export async function initORM(): Promise<MikroORM> {
  if (!orm) {
    orm = await MikroORM.init(config);
  }
  return orm;
}

export function getORM(): MikroORM {
  if (!orm) {
    throw new Error('ORM não inicializado. Chame initORM() primeiro.');
  }
  return orm;
}
