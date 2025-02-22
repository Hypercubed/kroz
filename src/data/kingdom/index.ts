// KINGDOM OF KROZ II Levels

export const title = 'Kingdom of Kroz II';

export const LEVELS = [
  // Level 1
  async () => (await import('./kingdom-1.map.json')).default, // Welcome to Kroz
  async () => (await import('./kingdom-2.map.json')).default, // Boxed In, Ends with extra key
  async () => (await import('./kingdom-3.txt?raw')).default,
  async () => (await import('./kingdom-4.map.json')).default, // Big Trouble, Needs a teleport from previous level
  async () => (await import('./kingdom-5.txt?raw')).default,
  async () => (await import('./kingdom-6.map.json')).default, // Wicked Corridors
  async () => (await import('./kingdom-7.txt?raw')).default,
  null, // GravOn:=true;GravRate:=0;Sideways:=true; LavaFlow:=true; LavaRate:=75;
  async () => (await import('./kingdom-9.txt?raw')).default,

  // Level 10
  async () => (await import('./kingdom-10.map.json')).default, // Nine Cells
  async () => (await import('./kingdom-11.txt?raw')).default,
  async () => (await import('./kingdom-12.map.json')).default, // Boulderville!
  async () => (await import('./kingdom-13.txt?raw')).default,
  async () => (await import('../lost/lost-46.map.json')).default, // One-Two-Three-Four, Same as level 46 of Lost Adventures.
  async () => (await import('./kingdom-15.txt?raw')).default,
  async () => (await import('./kingdom-16.map.json')).default, // Tunnels of Kroz
  async () => (await import('./kingdom-17.txt?raw')).default,
  async () => (await import('../lost/lost-18.map.json')).default, // Pinned Down, Same as level 42 of Lost Adventures.
  async () => (await import('./kingdom-19.txt?raw')).default,

  // Level 20
  async () => (await import('../lost/lost-22.map.json')).default, // Key Shop, Same as level 22 of Lost Adventures
  async () => (await import('./kingdom-21.txt?raw')).default,
  async () => (await import('../lost/lost-30.map.json')).default, // Locksmith Shoppe, Same as level 30 of Lost Adventures
  async () => (await import('./kingdom-23.txt?raw')).default,
  null, // GravOn:=true;GravRate:=0;Sideways:=true;  LavaFlow:=true;LavaRate:=75;
  async () => (await import('./kingdom-25.map.json')).default // The Sacred Temple
];
