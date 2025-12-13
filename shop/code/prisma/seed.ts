import { loadCharacters } from './seeders/character_seeder.ts';

async function main() {
  await loadCharacters();
}

main()
  .catch(e => console.error(e))
  .finally(() => console.log('Seeding finished'));
