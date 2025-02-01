const LEVELS = [
  null, // Must be level 0

  // 1
  null,
  async () => (await import('./caverns-2.map.json')).default,
  null,
  async () => (await import('./caverns-4.map.json')).default,
  null,
  null,
  async () => (await import('./caverns-7.map.json')).default,
  null,
  async () => (await import('./caverns-9.map.json')).default,

  // 10
  null,
  async () => (await import('./caverns-11.map.json')).default,
  async () => (await import('./caverns-12.map.json')).default,
  null,
  async () => (await import('./caverns-14.map.json')).default,
  null,
  async () => (await import('./caverns-16.map.json')).default,
  null,
  async () => (await import('./caverns-18.map.json')).default,
  null,

  // 20
  null, //TBD
  null, //TBD
  null,
  null, //TBD
  null,
  null, //TBD
  null,
  null, //TBD
  null,
  null, //TBD

  // 30
  null,
  null, //TBD
  null,
  null, //TBD
  null,
  null, //TBD
  null,
  null, //TBD
  null,
  null, //TBD

  async () => (await import('./caverns-40.map.json')).default,
];

export default LEVELS;

// Possible levels to add:
// - caverns-9
// - caverns-11
// - caverns-14
