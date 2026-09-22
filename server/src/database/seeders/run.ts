import 'reflect-metadata';
import { initORM } from '../../infra/orm.js';
import { WordRepository } from '../../repositories/WordRepository.js';
import { Word } from '../../domain/entities/Word.js';
import { WORD_LIST } from './wordList.js';

async function main() {
  const orm = await initORM();
  const em = orm.em.fork();
  const wordRepository = new WordRepository(em);

  let created = 0;
  for (const text of WORD_LIST) {
    const exists = await em.findOne(Word, { text });
    if (!exists) {
      wordRepository.create(text);
      created += 1;
    }
  }
  await wordRepository.flush();

  console.log(`Seed concluído: ${created} palavras novas inseridas (de ${WORD_LIST.length} no total).`);
  await orm.close();
}

main().catch((err) => {
  console.error('Falha ao rodar o seed:', err);
  process.exit(1);
});
