import { loadAchievements } from './seeders/achievement_seeder.ts';
import { loadUserAchievements, loadUserStats } from './seeders/user_stats_achievements_seeder.ts';

async function main() {
  await loadAchievements();
  await loadUserAchievements();
  await loadUserStats();
}

main()
  .catch(e => console.error(e))
  .finally(() => console.log('Seeding finished'));
