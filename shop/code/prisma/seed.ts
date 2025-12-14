import { loadCharacters } from './seeders/character_seeder.ts';
import { loadDecorations } from './seeders/decoration_seeder.ts';

async function main() {
  await loadCharacters();
  await loadDecorations();
}

main()
  .catch(e => console.error(e))
  .finally(() => console.log('Seeding finished'));
