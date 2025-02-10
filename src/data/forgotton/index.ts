// 'The Forgotton Adventures of Kroz'

export const title = 'The Forgotton Adventures of Kroz';

export const LEVELS = [
  async () => (await import('../debug/tiles.map.json')).default, // Must be level 0

  // 1
  async () => (await import('./lost-1.map.json')).default, // Your Hut
  async () => (await import('../lost/lost-2.map.json')).default, // The Secret Tunnel
  async () => (await import('../lost/lost-4.map.json')).default, // Monster Marketplace
  async () => (await import('../caverns/caverns-2.map.json')).default,
  async () => (await import('../caverns/caverns-4.map.json')).default,
  async () => (await import('../kingdom/kingdom-1.map.json')).default,
  async () => (await import('../kingdom/kingdom-2.map.json')).default, // Ends with extra key
  async () => (await import('../kingdom/kingdom-4.map.json')).default, // Needs a teleport from previous level
  async () => (await import('../kingdom/kingdom-6.map.json')).default,

  // 10
  async () => (await import('../lost/lost-11.map.json')).default,
  async () => (await import('../kingdom/kingdom-12.map.json')).default,
  async () => (await import('../lost/lost-18.map.json')).default,
  async () => (await import('../lost/lost-20.map.json')).default,
  async () => (await import('../lost/lost-26.map.json')).default,
  async () => (await import('../lost/lost-30.map.json')).default, // Need whips, Same as Kingdom 22
  async () => (await import('../lost/lost-34.map.json')).default,
  async () => (await import('../lost/lost-42.map.json')).default,
  async () => (await import('../lost/lost-46.map.json')).default, // Same as Kingdom 14
  async () => (await import('../lost/lost-48.map.json')).default,

  // 20
  async () => (await import('../lost/lost-52.map.json')).default,
  async () => (await import('../lost/lost-59.map.json')).default,
  async () => (await import('../lost/lost-61.map.json')).default,
  async () => (await import('../lost/lost-64.map.json')).default,
  async () => (await import('../lost/lost-70.map.json')).default,
  async () => (await import('../lost/lost-75.map.json')).default // The Sacred Chamber of Kroz
];

export async function readTileset() {
  return (await import('../kroz.tileset.json')).default;
}

export async function readColor() {
  return (await import('../kroz.colors.json')).default;
}

// Possible levels to add:
// - kingdom 10
// - Kingdom 20
// - Kingdom 25
