// KINGDOM OF KROZ II Levels

export const title = 'Kingdom of Kroz II';

export const LEVELS = [
  // Level 1
  async () => (await import('./kingdom-1.map.txt?raw')).default, // Welcome to Kroz
  async () => (await import('./kingdom-2.map.txt?raw')).default, // Boxed In, Ends with extra key
  async () => (await import('./kingdom-3.map.txt?raw')).default,
  async () => (await import('./kingdom-4.map.txt?raw')).default, // Big Trouble, Needs a teleport from previous level
  async () => (await import('./kingdom-5.map.txt?raw')).default,
  async () => (await import('./kingdom-6.map.txt?raw')).default, // Wicked Corridors
  async () => (await import('./kingdom-7.map.txt?raw')).default,
  null, // GravOn:=true;GravRate:=0;Sideways:=true; LavaFlow:=true; LavaRate:=75;
  async () => (await import('./kingdom-9.map.txt?raw')).default,

  // Level 10
  async () => (await import('./kingdom-10.map.json')).default, // Nine Cells
  async () => (await import('./kingdom-11.map.txt?raw')).default,
  async () => (await import('./kingdom-12.map.json')).default, // Boulderville!
  async () => (await import('./kingdom-13.map.txt?raw')).default,
  async () => (await import('../lost/lost-46.map.json')).default, // One-Two-Three-Four, Same as level 46 of Lost Adventures.
  async () => (await import('./kingdom-15.map.txt?raw')).default,
  async () => (await import('./kingdom-16.map.txt?raw')).default, // Tunnels of Kroz
  async () => (await import('./kingdom-17.map.txt?raw')).default,
  async () => (await import('../lost/lost-18.map.json')).default, // Pinned Down, Same as level 42 of Lost Adventures.
  async () => (await import('./kingdom-19.map.txt?raw')).default,

  // Level 20
  async () => (await import('../lost/lost-22.map.json')).default, // Key Shop, Same as level 22 of Lost Adventures
  async () => (await import('./kingdom-21.map.txt?raw')).default,
  async () => (await import('../lost/lost-30.map.json')).default, // Locksmith Shoppe, Same as level 30 of Lost Adventures
  async () => (await import('./kingdom-23.map.txt?raw')).default,
  null, // GravOn:=true;GravRate:=0;Sideways:=true;  LavaFlow:=true;LavaRate:=75;
  async () => (await import('./kingdom-25.map.txt?raw')).default // The Sacred Temple
];
