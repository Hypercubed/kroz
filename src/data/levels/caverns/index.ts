const LEVELS = [
  null, // Must be level 0

  null,
  async () => (await import('./caverns-2.map.json')).default,
  null,
  async () => (await import('./caverns-4.map.json')).default,
];

export default LEVELS;

// Possible levels to add:
// - caverns-9
// - caverns-11
// - caverns-14
