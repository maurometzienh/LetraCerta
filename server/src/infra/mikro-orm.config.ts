import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { User } from '../domain/entities/User.js';
import { Word } from '../domain/entities/Word.js';
import { DailyWord } from '../domain/entities/DailyWord.js';
import { Game } from '../domain/entities/Game.js';
import { Attempt } from '../domain/entities/Attempt.js';

const databaseUrl = process.env.DATABASE_URL;
const isLocalDatabase = /localhost|127\.0\.0\.1/.test(databaseUrl ?? '');

export default defineConfig({
  clientUrl: databaseUrl,
  entities: [User, Word, DailyWord, Game, Attempt],
  extensions: [Migrator],
  migrations: {
    path: 'src/database/migrations',
    pathTs: 'src/database/migrations',
    glob: '!(*.d).{js,ts}',
  },
  debug: process.env.NODE_ENV !== 'production',
  // Bancos gerenciados (Render, Railway, Supabase, ...) exigem conexão SSL;
  // um Postgres local (docker-compose) normalmente não tem/precisa de certificado.
  driverOptions: isLocalDatabase
    ? undefined
    : {
        connection: {
          ssl: { rejectUnauthorized: false },
        },
      },
});
