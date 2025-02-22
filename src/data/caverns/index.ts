export const title = 'The Caverns of Kroz';

export const LEVELS = [
  // 1
  async () => (await import('./caverns-1.txt?raw')).default,
  async () => (await import('./caverns-2.map.json')).default,
  async () => (await import('./caverns-3.txt?raw')).default,
  async () => (await import('./caverns-4.map.json')).default,
  async () => (await import('./caverns-5.txt?raw')).default,
  async () => (await import('./caverns-6.txt?raw')).default,
  async () => (await import('./caverns-7.map.json')).default,
  async () => (await import('./caverns-8.txt?raw')).default,
  async () => (await import('./caverns-9.map.json')).default,

  // 10
  async () => (await import('./caverns-10.txt?raw')).default,
  async () => (await import('./caverns-11.map.json')).default,
  async () => (await import('./caverns-12.map.json')).default,
  async () => (await import('./caverns-13.txt?raw')).default,
  async () => (await import('./caverns-14.map.json')).default,
  async () => (await import('./caverns-15.txt?raw')).default,
  async () => (await import('./caverns-16.map.json')).default,
  async () => (await import('./caverns-17.txt?raw')).default,
  async () => (await import('./caverns-18.map.json')).default,
  async () => (await import('./caverns-19.txt?raw')).default,

  // 20
  null, //TBD
  null, //TBD
  async () => (await import('./caverns-22.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-24.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-26.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-28.txt?raw')).default,
  null, //TBD

  // 30
  async () => (await import('./caverns-30.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-32.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-34.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-36.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-38.txt?raw')).default,
  null, //TBD

  async () => (await import('./caverns-40.map.json')).default
];

// Possible levels to add:
// - caverns-9
// - caverns-11
// - caverns-14
