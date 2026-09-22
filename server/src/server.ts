import 'reflect-metadata';
import 'dotenv/config';
import { buildApp } from './app.js';
import { initORM } from './infra/orm.js';

async function main() {
  await initORM();
  const app = buildApp();

  const port = Number(process.env.PORT ?? 3333);
  await app.listen({ port, host: '0.0.0.0' });
}

main().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
