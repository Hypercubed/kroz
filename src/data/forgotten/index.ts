// 'The Forgotten Adventures of Kroz'
export const title = 'The Forgotten Adventures of Kroz';

export const LEVELS = [
  // 1
  async () => (await import('./lost-1.map.json')).default, // Your Hut
  async () => (await import('../lost/lost-2.map.json')).default, // The Secret Tunnel
  async () => (await import('../kingdom/kingdom-1.map.txt?raw')).default,
  async () => (await import('../kingdom/kingdom-2.map.txt?raw')).default, // Ends with extra key
  async () => (await import('./lost-3.map.json')).default,
  async () => (await import('../caverns/caverns-2.map.txt?raw')).default,
  async () => (await import('../caverns/caverns-4.map.txt?raw')).default,
  async () => (await import('../lost/lost-4.map.json')).default, // Monster Marketplace
  async () => (await import('../kingdom/kingdom-4.map.txt?raw')).default, // Needs a teleport from previous level
  async () => (await import('../kingdom/kingdom-6.map.txt?raw')).default,

  async () => (await import('./lost-5.map.txt?raw')).default,
  async () => (await import('./lost-7.map.txt?raw')).default,
  async () => (await import('../caverns/caverns-7.map.json')).default,
  async () => (await import('../caverns/caverns-9.map.txt?raw')).default,
  async () => (await import('../lost/lost-11.map.json')).default,
  async () => (await import('./lost-12.map.json')).default,
  async () => (await import('../caverns/caverns-11.map.txt?raw')).default,
  async () => (await import('../caverns/caverns-12.map.txt?raw')).default,
  async () => (await import('../kingdom/kingdom-12.map.json')).default,
  async () => (await import('../kingdom/kingdom-16.map.txt?raw')).default,

  async () => (await import('../caverns/caverns-14.map.txt?raw')).default,
  async () => (await import('../caverns/caverns-16.map.txt?raw')).default,
  async () => (await import('../caverns/caverns-18.map.txt?raw')).default,
  async () => (await import('../lost/lost-18.map.json')).default,
  async () => (await import('../lost/lost-20.map.txt?raw')).default,
  async () => (await import('../lost/lost-22.map.json')).default,
  async () => (await import('../lost/lost-26.map.json')).default,
  async () => (await import('../lost/lost-30.map.json')).default, // Need whips, Same as Kingdom 22
  async () => (await import('../lost/lost-34.map.txt?raw')).default,
  async () => (await import('../lost/lost-42.map.json')).default,

  async () => (await import('../lost/lost-46.map.json')).default, // Same as Kingdom 14
  async () => (await import('../lost/lost-48.map.txt?raw')).default,
  async () => (await import('../lost/lost-52.map.json')).default,
  async () => (await import('../lost/lost-59.map.txt?raw')).default,
  async () => (await import('../lost/lost-61.map.json')).default,
  async () => (await import('../lost/lost-64.map.json')).default,
  async () => (await import('../lost/lost-70.map.txt?raw')).default,
  async () => (await import('../kingdom/kingdom-25.map.txt?raw')).default,
  async () => (await import('../caverns/caverns-40.map.txt?raw')).default,
  async () => (await import('../lost/lost-75.map.json')).default // The Sacred Chamber of Kroz
];

// Possible levels to add:
// - kingdom 10
// - Kingdom 20
// - Kingdom 25
