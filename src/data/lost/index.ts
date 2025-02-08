// LOST ADVENTURES OF KROZ Levels
export const LEVELS = [
  null, // Must be level 0

  // 1
  async () => (await import('./lost-1.map.json')).default, // Your Hut
  async () => (await import('./lost-2.map.json')).default, // The Secret Tunnel
  async () => (await import('./lost-3.txt?raw')).default,
  async () => (await import('./lost-4.map.json')).default, // Monster Marketplace
  async () => (await import('./lost-5.txt?raw')).default,
  null,
  async () => (await import('./lost-7.txt?raw')).default,
  null,
  null,

  // 10
  async () => (await import('./lost-10.txt?raw')).default,
  async () => (await import('./lost-11.map.json')).default, // Tortuous Tunnels
  async () => (await import('./lost-12.txt?raw')).default,
  null,
  null,
  null,
  async () => (await import('./lost-16.txt?raw')).default,
  async () => (await import('./lost-17.txt?raw')).default,
  async () => (await import('./lost-18.map.json')).default, // S and M
  async () => (await import('./lost-19.txt?raw')).default,

  // 20
  async () => (await import('./lost-20.map.json')).default, // Trouble All Around
  async () => (await import('./lost-21.txt?raw')).default,
  async () => (await import('./lost-22.map.json')).default, // Key Shop
  async () => (await import('./lost-23.txt?raw')).default,
  null,
  async () => (await import('./lost-25.txt?raw')).default,
  async () => (await import('./lost-26.map.json')).default, // Chamber of Rogues
  async () => (await import('./lost-27.txt?raw')).default,
  null,
  async () => (await import('./lost-29.txt?raw')).default,

  // 30
  async () => (await import('./lost-30.map.json')).default, // Locksmith Shoppe
  async () => (await import('./lost-31.txt?raw')).default,
  null,
  async () => (await import('./lost-33.map.json')).default, // Locksmith Shoppe // Needs to start with a key
  async () => (await import('./lost-34.map.json')).default, // Dark Shocker
  async () => (await import('./lost-35.map.json')).default,
  async () => (await import('./lost-36.txt?raw')).default,
  null,
  async () => (await import('./lost-38.txt?raw')).default,
  async () => (await import('./lost-39.txt?raw')).default,

  // 40
  async () => (await import('./lost-40.map.json')).default, // Needs two keys to start
  async () => (await import('./lost-41.txt?raw')).default,
  async () => (await import('./lost-42.map.json')).default, // Klose Enkounters
  async () => (await import('./lost-43.txt?raw')).default,
  null,
  async () => (await import('./lost-45.txt?raw')).default,
  async () => (await import('./lost-46.map.json')).default, // One-Two-Three-Four
  async () => (await import('./lost-47.txt?raw')).default,
  async () => (await import('./lost-48.map.json')).default, // The Swamp
  async () => (await import('./lost-49.txt?raw')).default,

  async () => (await import('./lost-50.txt?raw')).default,
  async () => (await import('./lost-51.txt?raw')).default,
  async () => (await import('./lost-52.map.json')).default, // Follow the Bread Crumbs
  null,
  null,
  null,
  null,
  async () => (await import('./lost-57.txt?raw')).default,
  async () => (await import('./lost-58.txt?raw')).default,
  async () => (await import('./lost-59.map.json')).default, // Cornered

  async () => (await import('./lost-60.txt?raw')).default,
  async () => (await import('./lost-61.map.json')).default, // Chamber of Horror
  async () => (await import('./lost-62.txt?raw')).default,
  async () => (await import('./lost-63.txt?raw')).default,
  async () => (await import('./lost-64.map.json')).default, // The Spirit of Kroz
  async () => (await import('./lost-65.txt?raw')).default,
  null,
  async () => (await import('./lost-67.txt?raw')).default,
  null,
  async () => (await import('./lost-69.txt?raw')).default,

  async () => (await import('./lost-70.map.json')).default, // Legions of Trouble
  async () => (await import('./lost-71.txt?raw')).default,
  null,
  async () => (await import('./lost-73.txt?raw')).default,
  async () => (await import('./lost-74.map.json')).default, // Heat Wave!
  async () => (await import('./lost-75.map.json')).default
];

export async function readTileset() {
  return (await import('../kroz.tileset.json')).default;
}

export async function readColor() {
  return (await import('../kroz.colors.json')).default;
}
