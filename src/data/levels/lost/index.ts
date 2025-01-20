// LOST ADVENTURES OF KROZ Levels
const LEVELS = [
  null, // Must be level 0

  // 1
  async () => (await import('./lost-1.map.json')).default, // Your Hut
  async () => (await import('./lost-2.map.json')).default, // The Secret Tunnel
  null,
  async () => (await import('./lost-4.map.json')).default, // Monster Marketplace
  null,
  null,
  null,
  null,
  null,

  // 10
  null,
  async () => (await import('./lost-11.map.json')).default, // Tortuous Tunnels
  null,
  null,
  null,
  null,
  null,
  null,
  async () => (await import('./lost-18.map.json')).default, // S and M
  null,

  async () => (await import('./lost-20.map.json')).default, // Trouble All Around
  null,
  async () => (await import('./lost-22.map.json')).default, // Key Shop
  null,
  null,
  null,
  async () => (await import('./lost-26.map.json')).default, // Chamber of Rogues
  null,
  null,
  null,

  async () => (await import('./lost-30.map.json')).default, // Locksmith Shoppe
  null,
  null,
  null, // lost33, // Needs to start with a key
  async () => (await import('./lost-34.map.json')).default, // Dark Shocker
  null, // Needs lava flow
  null,
  null,
  null,
  null,

  null, // Needs two keys to start
  null,
  async () => (await import('./lost-42.map.json')).default, // Klose Enkounters
  null,
  null,
  null,
  async () => (await import('./lost-46.map.json')).default, // One-Two-Three-Four
  null,
  async () => (await import('./lost-48.map.json')).default, // The Swamp
  null,

  null,
  null,
  async () => (await import('./lost-52.map.json')).default, // Follow the Bread Crumbs
  null,
  null,
  null,
  null,
  null,
  null,
  async () => (await import('./lost-59.map.json')).default, // Cornered

  null,
  async () => (await import('./lost-61.map.json')).default, // Chamber of Horror
  null,
  null,
  async () => (await import('./lost-64.map.json')).default, // The Spirit of Kroz
  null,
  null,
  null,
  null,
  null,

  async () => (await import('./lost-70.map.json')).default, // Legions of Trouble
  null,
  null,
  null,
  null, // lost74, // Heat Wave!
  async () => (await import('./lost-75.map.json')).default,
];

export default LEVELS;
