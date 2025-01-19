import { readLevelJSON } from '../../../modules/levels';

const LEVELS = [
  null, // Must be level 0

  null,
  async () => readLevelJSON((await import('./caverns-2.map.json')).default),
  null,
  async () => readLevelJSON((await import('./caverns-4.map.json')).default),
];

export default LEVELS;
