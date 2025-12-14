import { loadAchievements } from './seeders/achievement_seeder.ts';

async function main() {
  await loadAchievements();
}

main()
  .catch(e => console.error(e))
  .finally(() => console.log('Seeding finished'));
