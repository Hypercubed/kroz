import { getASCIICode } from '../utils/utils';
import { Color } from '../modules/colors';

const FLOOR_CHAR = ' ';

export enum Type {
  Border = -1,
  Floor = 0,
  Slow = 1,
  Medium = 2,
  Fast = 3,
  Block = 4,
  Whip = 5,
  Stairs = 6,
  Chest = 7,
  SlowTime = 8,
  Gem = 9,
  Invisible = 10,
  Teleport = 11,
  Key = 12,
  Door = 13,
  Wall = 14,
  SpeedTime = 15,
  Trap = 16,
  River = 17,
  Power = 18,
  Forest = 19,
  Tree = 20,
  Bomb = 21,
  Lava = 22,
  Pit = 23,
  Tome = 24,
  Tunnel = 25,
  Freeze = 26,
  Nugget = 27,
  Quake = 28,
  IBlock = 29,
  IWall = 30,
  IDoor = 31,
  Stop = 32,
  Trap2 = 33,
  Zap = 34,
  Create = 35,
  Generator = 36,
  Trap3 = 37,
  MBlock = 38,
  Trap4 = 39,
  Player = 40,
  ShowGems = 41,
  Tablet = 42,
  ZBlock = 43,
  BlockSpell = 44,
  Chance = 45,
  Statue = 46,
  WallVanish = 47,
  K = 48,
  R = 49,
  O = 50,
  Z = 51,
  OWall1 = 52,
  OWall2 = 53,
  OWall3 = 54,
  CWall1 = 55,
  CWall2 = 56,
  CWall3 = 57,
  OSpell1 = 58,
  OSpell2 = 59,
  OSpell3 = 60,
  CSpell1 = 61,
  CSpell2 = 62,
  CSpell3 = 63,
  GBlock = 64,
  Rock = 65,
  EWall = 66,
  Trap5 = 67,
  TBlock = 68,
  TRock = 69,
  TGem = 70,
  TBlind = 71,
  TWhip = 72,
  TGold = 73,
  TTree = 74,
  Rope = 75,
  DropRope = 76,
  DropRope2 = 77,
  DropRope3 = 78,
  DropRope4 = 79,
  DropRope5 = 80,
  Amulet = 81,
  ShootRight = 82,
  ShootLeft = 83,

  Trap6 = 224,
  Trap7 = 225,
  Trap8 = 226,
  Trap9 = 227,
  Trap10 = 228,
  Trap11 = 229,
  Trap12 = 230,
  Trap13 = 231,

  Message = 252
}

export const TypeChar: Record<Type, string> = {
  [Type.Border]: '▒',
  [Type.Floor]: FLOOR_CHAR,
  [Type.Slow]: 'Ä',
  [Type.Medium]: 'Ö',
  [Type.Fast]: 'Ω',
  [Type.Block]: '▓',
  [Type.Whip]: '⌠',
  [Type.Stairs]: '≡',
  [Type.Chest]: 'C',
  [Type.SlowTime]: 'Φ',
  [Type.Gem]: '♦',
  [Type.Invisible]: '¡',
  [Type.Teleport]: '↑',
  [Type.Key]: 'î',
  [Type.Door]: '∞',
  [Type.Wall]: '█',
  [Type.SpeedTime]: 'Θ',
  [Type.Trap]: '∙',
  [Type.River]: '≈',
  [Type.Power]: '○',
  [Type.Forest]: '█',
  [Type.Tree]: '♣',
  [Type.Bomb]: '¥',
  [Type.Lava]: '▓',
  [Type.Pit]: '░',
  [Type.Tome]: '■',
  [Type.Tunnel]: '∩',
  [Type.Freeze]: 'ƒ',
  [Type.Nugget]: '☼',
  [Type.Quake]: FLOOR_CHAR,
  [Type.IBlock]: FLOOR_CHAR,
  [Type.IWall]: FLOOR_CHAR,
  [Type.IDoor]: FLOOR_CHAR,
  [Type.Stop]: FLOOR_CHAR,
  [Type.Trap2]: FLOOR_CHAR,
  [Type.Zap]: '▲',
  [Type.Create]: '▼',
  [Type.Generator]: '♠',
  [Type.Trap3]: FLOOR_CHAR,
  [Type.MBlock]: '▓',
  [Type.Trap4]: FLOOR_CHAR,
  [Type.Player]: '☻',
  [Type.ShowGems]: FLOOR_CHAR,
  [Type.Tablet]: '■',
  [Type.ZBlock]: '▓',
  [Type.BlockSpell]: FLOOR_CHAR,
  [Type.Chance]: '?',
  [Type.Statue]: '☺',
  [Type.WallVanish]: FLOOR_CHAR,
  [Type.K]: 'K',
  [Type.R]: 'R',
  [Type.O]: 'O',
  [Type.Z]: 'Z',
  [Type.OWall1]: '█',
  [Type.OWall2]: '█',
  [Type.OWall3]: '█',
  [Type.CWall1]: FLOOR_CHAR,
  [Type.CWall2]: FLOOR_CHAR,
  [Type.CWall3]: FLOOR_CHAR,
  [Type.OSpell1]: '⌂',
  [Type.OSpell2]: '⌂',
  [Type.OSpell3]: '⌂',
  [Type.CSpell1]: FLOOR_CHAR,
  [Type.CSpell2]: FLOOR_CHAR,
  [Type.CSpell3]: FLOOR_CHAR,
  [Type.GBlock]: '▓',
  [Type.Rock]: 'O',
  [Type.EWall]: 'X',
  [Type.Trap5]: FLOOR_CHAR,
  [Type.TBlock]: FLOOR_CHAR,
  [Type.TRock]: FLOOR_CHAR,
  [Type.TGem]: FLOOR_CHAR,
  [Type.TBlind]: FLOOR_CHAR,
  [Type.TWhip]: FLOOR_CHAR,
  [Type.TGold]: FLOOR_CHAR,
  [Type.TTree]: FLOOR_CHAR,
  [Type.Rope]: '│',
  [Type.DropRope]: '↓',
  [Type.DropRope2]: '↓',
  [Type.DropRope3]: '↓',
  [Type.DropRope4]: '↓',
  [Type.DropRope5]: '↓',
  [Type.Amulet]: '♀',
  [Type.ShootRight]: '→',
  [Type.ShootLeft]: '←',

  [Type.Trap6]: FLOOR_CHAR,
  [Type.Trap7]: FLOOR_CHAR,
  [Type.Trap8]: FLOOR_CHAR,
  [Type.Trap9]: FLOOR_CHAR,
  [Type.Trap10]: FLOOR_CHAR,
  [Type.Trap11]: FLOOR_CHAR,
  [Type.Trap12]: FLOOR_CHAR,
  [Type.Trap13]: FLOOR_CHAR,

  [Type.Message]: '♣'
};

export const MapLookup: Record<string, Type> = {
  ' ': Type.Floor,
  '1': Type.Slow,
  '2': Type.Medium,
  '3': Type.Fast,
  X: Type.Block,
  W: Type.Whip,
  L: Type.Stairs,
  C: Type.Chest,
  S: Type.SlowTime,
  '+': Type.Gem,
  I: Type.Invisible,
  T: Type.Teleport,
  K: Type.Key,
  D: Type.Door,
  '#': Type.Wall,
  F: Type.SpeedTime,
  '.': Type.Trap,
  R: Type.River,
  Q: Type.Power,
  '/': Type.Forest,
  '\\': Type.Tree,
  // '♣': Type.Tree,
  B: Type.Bomb,
  V: Type.Lava,
  '=': Type.Pit,
  A: Type.Tome,
  U: Type.Tunnel,
  Z: Type.Freeze,
  '*': Type.Nugget,
  E: Type.Quake,
  ';': Type.IBlock,
  ':': Type.IWall,
  '`': Type.IDoor, // TODO: Add a seconday char for IDoor
  '-': Type.Stop,
  '@': Type.Trap2,
  '%': Type.Zap,
  ']': Type.Create,
  G: Type.Generator,
  ')': Type.Trap3,
  M: Type.MBlock,
  '(': Type.Trap4,
  P: Type.Player,
  '&': Type.ShowGems,
  '!': Type.Tablet,
  O: Type.ZBlock,
  H: Type.BlockSpell,
  '?': Type.Chance,
  '>': Type.Statue,
  N: Type.WallVanish,
  '<': Type.K,
  '[': Type.R,
  '|': Type.O,
  '"': Type.Z,
  '4': Type.OWall1,
  '5': Type.OWall2,
  '6': Type.OWall3,
  '7': Type.CWall1,
  '8': Type.CWall2,
  '9': Type.CWall3,
  ñ: Type.OSpell1,
  ò: Type.OSpell2,
  ó: Type.OSpell3,
  ô: Type.CSpell1,
  õ: Type.CSpell2,
  ö: Type.CSpell3,
  Y: Type.GBlock,
  '0': Type.Rock,
  '~': Type.EWall,
  $: Type.Trap5,
  '‘': Type.TBlock,
  '’': Type.TRock,
  '“': Type.TGem,
  '”': Type.TBlind,
  '•': Type.TWhip,
  '–': Type.TGold,
  '—': Type.TTree,
  '³': Type.Rope,
  '¹': Type.DropRope,
  º: Type.DropRope2,
  '»': Type.DropRope3,
  '¼': Type.DropRope4,
  '½': Type.DropRope5,
  ƒ: Type.Amulet,
  â: Type.Amulet,
  '¯': Type.ShootRight,
  '®': Type.ShootLeft,

  à: Type.Trap6,
  á: Type.Trap7,
  // â: Type.Trap8, // FIX this
  ã: Type.Trap9,
  ä: Type.Trap10,
  å: Type.Trap11,
  æ: Type.Trap12,
  ç: Type.Trap13,

  ü: Type.Message
};

export const TypeColor: Record<Type, [Color | null, Color | null]> = {
  [Type.Border]: [Color.LightBlue, Color.Black],
  [Type.Floor]: [Color.Black, Color.Black],
  [Type.Slow]: [Color.LightRed, null],
  [Type.Medium]: [Color.LightBlue, null],
  [Type.Fast]: [Color.Green, null],
  [Type.Block]: [Color.Brown, null],
  [Type.Whip]: [Color.HighIntensityWhite, null],
  [Type.Stairs]: [Color.Black | 16, Color.White],
  [Type.Chest]: [Color.Yellow, Color.Red],
  [Type.SlowTime]: [Color.LightCyan, null],
  [Type.Gem]: [Color.Blue, null],
  [Type.Invisible]: [Color.Green, null],
  [Type.Teleport]: [Color.LightMagenta, null],
  [Type.Key]: [Color.LightRed, null],
  [Type.Door]: [Color.Cyan, Color.Magenta],
  [Type.Wall]: [Color.Brown, Color.Brown],
  [Type.SpeedTime]: [Color.LightCyan, null],
  [Type.Trap]: [Color.White, null],
  [Type.River]: [Color.LightBlue, Color.Blue],
  [Type.Power]: [Color.HighIntensityWhite, null],
  [Type.Forest]: [Color.Green, Color.Green],
  [Type.Tree]: [Color.Brown, Color.Green],
  [Type.Bomb]: [Color.HighIntensityWhite, null],
  [Type.Lava]: [Color.LightRed, Color.Red],
  [Type.Pit]: [Color.White, null],
  [Type.Tome]: [Color.HighIntensityWhite | 32, Color.Magenta],
  [Type.Tunnel]: [Color.HighIntensityWhite, null],
  [Type.Freeze]: [Color.LightCyan, null],
  [Type.Nugget]: [Color.Yellow, null], // ArtColor
  [Type.Quake]: [Color.HighIntensityWhite, null],
  [Type.IBlock]: [null, null],
  [Type.IWall]: [null, null],
  [Type.IDoor]: [null, null],
  [Type.Stop]: [null, null],
  [Type.Zap]: [Color.LightRed, null],
  [Type.Create]: [Color.HighIntensityWhite, null],
  [Type.Generator]: [Color.Yellow | 16, null], // 30
  [Type.MBlock]: [Color.Brown, null],
  [Type.Trap2]: [null, null],
  [Type.Trap3]: [null, null],
  [Type.Trap4]: [null, null],
  [Type.Trap5]: [null, null],
  [Type.Trap6]: [null, null],
  [Type.Trap7]: [null, null],
  [Type.Trap8]: [null, null],
  [Type.Trap9]: [null, null],
  [Type.Trap10]: [null, null],
  [Type.Trap11]: [null, null],
  [Type.Trap12]: [null, null],
  [Type.Trap13]: [null, null],
  [Type.Player]: [Color.Yellow, Color.Black], // 16
  [Type.ShowGems]: [null, null],
  [Type.Tablet]: [Color.LightBlue, null],
  [Type.ZBlock]: [Color.Brown, null],
  [Type.BlockSpell]: [null, null],
  [Type.Chance]: [Color.HighIntensityWhite, null],
  [Type.Statue]: [Color.HighIntensityWhite | 16, null], // 31
  [Type.K]: [Color.Yellow, null],
  [Type.R]: [Color.Yellow, null],
  [Type.O]: [Color.Yellow, null],
  [Type.Z]: [Color.Yellow, null],
  [Type.OWall1]: [Color.Brown, Color.Brown],
  [Type.OWall2]: [Color.Brown, Color.Brown],
  [Type.OWall3]: [Color.White, Color.White],
  [Type.CWall1]: [null, null],
  [Type.CWall2]: [null, null],
  [Type.CWall3]: [null, null],
  [Type.OSpell1]: [Color.LightCyan, null],
  [Type.OSpell2]: [Color.LightCyan, null],
  [Type.OSpell3]: [Color.LightCyan, null],
  [Type.CSpell1]: [null, null],
  [Type.CSpell2]: [null, null],
  [Type.CSpell3]: [null, null],
  [Type.GBlock]: [Color.White, Color.Black],
  [Type.Rock]: [Color.White, null],
  [Type.EWall]: [Color.LightRed, Color.Red],
  [Type.TBlock]: [null, null],
  [Type.TRock]: [null, null],
  [Type.TGem]: [null, null],
  [Type.TBlind]: [null, null],
  [Type.TWhip]: [null, null],
  [Type.TGold]: [null, null],
  [Type.TTree]: [null, null],
  [Type.WallVanish]: [Color.HighIntensityWhite, null],
  [Type.Rope]: [Color.White, null],
  [Type.DropRope]: [Color.White, null],
  [Type.DropRope2]: [Color.White, null],
  [Type.DropRope3]: [Color.White, null],
  [Type.DropRope4]: [Color.White, null],
  [Type.DropRope5]: [Color.White, null],
  [Type.ShootRight]: [Color.White, null],
  [Type.ShootLeft]: [Color.White, null],
  [Type.Amulet]: [Color.HighIntensityWhite | 16, null], // 31

  [Type.Message]: [Color.Brown, Color.Green]
};

export const TypeMessage: Partial<Record<Type, string>> = {
  [Type.Border]: 'An Electrified Wall blocks your way.',
  [Type.Block]: 'A Breakable Wall blocks your way',
  [Type.Whip]: 'You have found a Whip',
  [Type.Stairs]: 'Stairs take you to the next lower level.',
  [Type.Chest]: '`You found gems and whips inside the chest!',
  [Type.SlowTime]: 'You activated a Slow Time spell.',
  [Type.Gem]: 'Gems give you both points and strength.',
  [Type.Invisible]: 'Oh no, a temporary Blindness Potion!',
  [Type.Teleport]: 'You found a Teleport scroll.',
  [Type.Key]: 'Use Keys to unlock doors.',
  [Type.Door]: 'The Door opens!  (One of your Keys is used.)',
  [Type.Wall]: 'A Solid Wall blocks your way.',
  [Type.River]: 'You cannot travel through Water.',
  [Type.SpeedTime]: 'You activated a Speed Creature spell.',
  [Type.Trap]: 'You activated a Teleport trap!',
  [Type.Power]: 'A Power Ring--your whip is now a little stronger!',
  [Type.Tree]: 'A tree blocks your way.',
  [Type.Forest]: 'You cannot travel through forest terrain.',
  [Type.Bomb]: 'You activated a Magic Bomb!',
  [Type.Lava]: 'Oooooooooooooooooooh!  Lava hurts!  (Lose 10 Gems.)',
  [Type.Pit]: '* SPLAT!! *',
  [Type.Tome]: 'The Sacred Tome of Kroz is finally yours--50,000 points!',
  [Type.Tunnel]: 'You passed through a secret Tunnel!',
  [Type.Freeze]: 'You have activated a Freeze Creature spell!',
  [Type.Nugget]: 'You found a Gold Nugget...500 points!',
  [Type.Quake]: 'Oh no, you set off an Earthquake trap!',
  [Type.IBlock]: 'An Invisible Crumbled Wall blocks your way.',
  [Type.IDoor]: 'An Invisible Door blocks your way.',
  [Type.Zap]: 'A Creature Zap Spell!',
  [Type.Create]: 'A Creature Creation Trap!',
  [Type.Generator]: 'You have discovered a Creature Generator!',
  [Type.MBlock]: 'A Moving Wall blocks your way.',
  [Type.ShowGems]: 'Yah Hoo! You discovered a Reveal Gems Scroll!',
  [Type.Tablet]: 'You found an Ancient Tablet of Wisdom...2,500 points!',
  [Type.BlockSpell]: 'You triggered Exploding Walls!',
  [Type.Chance]: 'You found a Pouch containing Gems!',
  [Type.Statue]: 'Statues are very dangerous...they drain your Gems!',
  [Type.WallVanish]:
    'Yikes!  A trap has made many of the wall sections invisible!',
  [Type.Z]: 'Super Kroz Bonus -- 10,000 points!',
  [Type.OWall1]: 'A Solid Wall blocks your way.',
  [Type.OSpell1]: 'Magic has been released is this chamber!',
  [Type.OSpell2]: 'Magic has been released is this chamber!',
  [Type.OSpell3]: 'Magic has been released is this chamber!',
  [Type.CSpell1]: 'New Walls have magically appeared!',
  [Type.CSpell2]: 'New Walls have magically appeared!',
  [Type.CSpell3]: 'New Walls have magically appeared!',
  [Type.Rock]: 'You pushed a big Boulder!',
  [Type.EWall]: 'You hit a Electrified Wall!  You lose one Gem.',
  [Type.Rope]: 'You grabbed a Rope.',
  [Type.Amulet]: 'YOUR QUEST FOR THE AMULET WAS SUCCESSFUL!'
};

let keys = Object.keys(MapLookup).sort((a, b) => MapLookup[a] - MapLookup[b]);
for (const key of keys) {
  const asc = getASCIICode(key);
  const type = MapLookup[key];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log(`${key},${type},${Type[type as any]},${asc}`);
}

keys = Object.keys(TypeChar);
for (const key of keys) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log(`${key},${Type[key as any]},${(TypeChar as any)[key]}`);
}
