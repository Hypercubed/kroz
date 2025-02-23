export const title = 'The Caverns of Kroz';

export const LEVELS = [
  // 1
  async () => (await import('./caverns-1.map.txt?raw')).default,
  async () => (await import('./caverns-2.map.txt?raw')).default,
  async () => (await import('./caverns-3.map.txt?raw')).default,
  async () => (await import('./caverns-4.map.txt?raw')).default,
  async () => (await import('./caverns-5.map.txt?raw')).default,
  async () => (await import('./caverns-6.map.txt?raw')).default,
  async () => (await import('./caverns-7.map.json')).default,
  async () => (await import('./caverns-8.map.txt?raw')).default,
  async () => (await import('./caverns-9.map.txt?raw')).default,

  // 10
  async () => (await import('./caverns-10.map.txt?raw')).default,
  async () => (await import('./caverns-11.map.txt?raw')).default,
  async () => (await import('./caverns-12.map.txt?raw')).default,
  async () => (await import('./caverns-13.map.txt?raw')).default,
  async () => (await import('./caverns-14.map.txt?raw')).default,
  async () => (await import('./caverns-15.map.txt?raw')).default,
  async () => (await import('./caverns-16.map.txt?raw')).default,
  async () => (await import('./caverns-17.map.txt?raw')).default,
  async () => (await import('./caverns-18.map.txt?raw')).default,
  async () => (await import('./caverns-19.map.txt?raw')).default,

  // 20
  null, //TBD
  null, //TBD
  async () => (await import('./caverns-22.map.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-24.map.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-26.map.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-28.map.txt?raw')).default,
  null, //TBD

  // 30
  async () => (await import('./caverns-30.map.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-32.map.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-34.map.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-36.map.txt?raw')).default,
  null, //TBD
  async () => (await import('./caverns-38.map.txt?raw')).default,
  null, //TBD

  async () => (await import('./caverns-40.map.txt?raw')).default
];

// Possible levels to add:
// - caverns-9
// - caverns-11
// - caverns-14
