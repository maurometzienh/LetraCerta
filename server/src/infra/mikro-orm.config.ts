import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { User } from '../domain/entities/User.js';
import { Word } from '../domain/entities/Word.js';
import { DailyWord } from '../domain/entities/DailyWord.js';
import { Game } from '../domain/entities/Game.js';
import { Attempt } from '../domain/entities/Attempt.js';

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: [User, Word, DailyWord, Game, Attempt],
  extensions: [Migrator],
  migrations: {
    path: 'src/database/migrations',
    pathTs: 'src/database/migrations',
    glob: '!(*.d).{js,ts}',
  },
  debug: process.env.NODE_ENV !== 'production',
});
