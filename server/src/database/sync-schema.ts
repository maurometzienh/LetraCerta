import 'reflect-metadata';
import { initORM } from '../infra/orm.js';

async function main() {
  const orm = await initORM();
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();
  console.log('Schema sincronizado com sucesso.');
  await orm.close();
}

main().catch((err) => {
  console.error('Falha ao sincronizar schema:', err);
  process.exit(1);
});
