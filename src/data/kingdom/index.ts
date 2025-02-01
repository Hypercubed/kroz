// KINGDOM OF KROZ II Levels
const LEVELS = [
  null, // Must be level 0

  // Level 1
  async () => (await import('./kingdom-1.map.json')).default, // Welcome to Kroz
  async () => (await import('./kingdom-2.map.json')).default, // Boxed In, Ends with extra key
  null,
  async () => (await import('./kingdom-4.map.json')).default, // Big Trouble, Needs a teleport from previous level
  null,
  async () => (await import('./kingdom-6.map.json')).default, // Wicked Corridors
  null,
  null, // GravOn:=true;GravRate:=0;Sideways:=true; LavaFlow:=true; LavaRate:=75;
  null,

  // Level 10
  async () => (await import('./kingdom-10.map.json')).default, // Nine Cells
  null,
  async () => (await import('./kingdom-12.map.json')).default, // Boulderville!
  null,
  async () => (await import('../lost/lost-46.map.json')).default, // One-Two-Three-Four, Same as level 46 of Lost Adventures.
  null,
  async () => (await import('./kingdom-16.map.json')).default, // Tunnels of Kroz
  null,
  async () => (await import('../lost/lost-18.map.json')).default, // Pinned Down, Same as level 42 of Lost Adventures.
  null,

  // Level 20
  async () => (await import('../lost/lost-22.map.json')).default, // Key Shop, Same as level 22 of Lost Adventures
  null,
  async () => (await import('../lost/lost-30.map.json')).default, // Locksmith Shoppe, Same as level 30 of Lost Adventures
  null,
  null, // GravOn:=true;GravRate:=0;Sideways:=true;  LavaFlow:=true;LavaRate:=75;
  async () => (await import('./kingdom-25.map.json')).default, // The Sacred Temple
];

export default LEVELS;
