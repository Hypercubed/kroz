// LOST ADVENTURES OF KROZ Levels

export const title = 'Lost Adventures of Kroz';

export const LEVELS = [
  // 1
  async () => (await import('./lost-1.map.json')).default, // Your Hut
  async () => (await import('./lost-2.map.json')).default, // The Secret Tunnel
  async () => (await import('./lost-3.map.txt?raw')).default,
  async () => (await import('./lost-4.map.json')).default, // Monster Marketplace
  async () => (await import('./lost-5.map.txt?raw')).default,
  null,
  async () => (await import('./lost-7.map.txt?raw')).default,
  null,
  null,

  // 10
  async () => (await import('./lost-10.map.txt?raw')).default,
  async () => (await import('./lost-11.map.json')).default, // Tortuous Tunnels
  async () => (await import('./lost-12.map.txt?raw')).default,
  null,
  null,
  null,
  async () => (await import('./lost-16.map.txt?raw')).default,
  async () => (await import('./lost-17.map.txt?raw')).default,
  async () => (await import('./lost-18.map.json')).default, // S and M
  async () => (await import('./lost-19.map.txt?raw')).default,

  // 20
  async () => (await import('./lost-20.map.txt?raw')).default, // Trouble All Around
  async () => (await import('./lost-21.map.txt?raw')).default,
  async () => (await import('./lost-22.map.json')).default, // Key Shop
  async () => (await import('./lost-23.map.txt?raw')).default,
  null,
  async () => (await import('./lost-25.map.txt?raw')).default,
  async () => (await import('./lost-26.map.json')).default, // Chamber of Rogues
  async () => (await import('./lost-27.map.txt?raw')).default,
  null,
  async () => (await import('./lost-29.map.txt?raw')).default,

  // 30
  async () => (await import('./lost-30.map.json')).default, // Locksmith Shoppe
  async () => (await import('./lost-31.map.txt?raw')).default,
  null,
  async () => (await import('./lost-33.map.txt?raw')).default, // Locksmith Shoppe // Needs to start with a key
  async () => (await import('./lost-34.map.txt?raw')).default, // Dark Shocker
  async () => (await import('./lost-35.map.txt?raw')).default,
  async () => (await import('./lost-36.map.txt?raw')).default,
  null,
  async () => (await import('./lost-38.map.txt?raw')).default,
  async () => (await import('./lost-39.map.txt?raw')).default,

  // 40
  async () => (await import('./lost-40.map.json')).default, // Needs two keys to start
  async () => (await import('./lost-41.map.txt?raw')).default,
  async () => (await import('./lost-42.map.json')).default, // Klose Enkounters
  async () => (await import('./lost-43.map.txt?raw')).default,
  null,
  async () => (await import('./lost-45.map.txt?raw')).default,
  async () => (await import('./lost-46.map.json')).default, // One-Two-Three-Four
  async () => (await import('./lost-47.map.txt?raw')).default,
  async () => (await import('./lost-48.map.txt?raw')).default, // The Swamp
  async () => (await import('./lost-49.map.txt?raw')).default,

  // 50
  async () => (await import('./lost-50.map.txt?raw')).default,
  async () => (await import('./lost-51.map.txt?raw')).default,
  async () => (await import('./lost-52.map.json')).default, // Follow the Bread Crumbs
  null,
  null,
  null,
  null,
  async () => (await import('./lost-57.map.txt?raw')).default,
  async () => (await import('./lost-58.map.txt?raw')).default,
  async () => (await import('./lost-59.map.txt?raw')).default, // Cornered

  // 60
  async () => (await import('./lost-60.map.txt?raw')).default,
  async () => (await import('./lost-61.map.json')).default, // Chamber of Horror
  async () => (await import('./lost-62.map.txt?raw')).default,
  async () => (await import('./lost-63.map.txt?raw')).default,
  async () => (await import('./lost-64.map.json')).default, // The Spirit of Kroz
  async () => (await import('./lost-65.map.txt?raw')).default,
  null,
  async () => (await import('./lost-67.map.txt?raw')).default,
  null,
  async () => (await import('./lost-69.map.txt?raw')).default,

  // 70
  async () => (await import('./lost-70.map.txt?raw')).default, // Legions of Trouble
  async () => (await import('./lost-71.map.txt?raw')).default,
  null,
  async () => (await import('./lost-73.map.txt?raw')).default,
  async () => (await import('./lost-74.map.json')).default, // Heat Wave!
  async () => (await import('./lost-75.map.json')).default
];
