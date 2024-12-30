import { Color } from './colors';
import { FLOOR_CHAR } from './constants';

export enum Tile {
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

  Message = 252,
}

export const TileChar: Record<Tile, string> = {
  [Tile.Floor]: FLOOR_CHAR,
  [Tile.Slow]: 'Ä',
  [Tile.Medium]: 'Ö',
  [Tile.Fast]: 'Ω',
  [Tile.Block]: '▓',
  [Tile.Whip]: '⌠',
  [Tile.Stairs]: '≡',
  [Tile.Chest]: 'C',
  [Tile.SlowTime]: 'Φ',
  [Tile.Gem]: '♦',
  [Tile.Invisible]: '¡',
  [Tile.Teleport]: '↑',
  [Tile.Key]: 'î',
  [Tile.Door]: 'ì',
  [Tile.Wall]: '█',
  [Tile.SpeedTime]: 'Θ',
  [Tile.Trap]: '∙',
  [Tile.River]: '≈',
  [Tile.Power]: '○',
  [Tile.Forest]: '█',
  [Tile.Tree]: '♣',
  [Tile.Bomb]: '¥',
  [Tile.Lava]: '▓',
  [Tile.Pit]: '░',
  [Tile.Tome]: '■',
  [Tile.Tunnel]: '∩',
  [Tile.Freeze]: 'ƒ',
  [Tile.Nugget]: '☼',
  [Tile.Quake]: FLOOR_CHAR,
  [Tile.IBlock]: '▲',
  [Tile.IWall]: FLOOR_CHAR,
  [Tile.IDoor]: FLOOR_CHAR,
  [Tile.Stop]: FLOOR_CHAR,
  [Tile.Trap2]: FLOOR_CHAR,
  [Tile.Zap]: '▲',
  [Tile.Create]: '▼',
  [Tile.Generator]: '♠',
  [Tile.Trap3]: FLOOR_CHAR,
  [Tile.MBlock]: '▓',
  [Tile.Trap4]: FLOOR_CHAR,
  [Tile.Player]: '☻',
  [Tile.ShowGems]: FLOOR_CHAR,
  [Tile.Tablet]: '■',
  [Tile.ZBlock]: '▓',
  [Tile.BlockSpell]: FLOOR_CHAR,
  [Tile.Chance]: '?',
  [Tile.Statue]: '☺',
  [Tile.WallVanish]: FLOOR_CHAR,
  [Tile.K]: 'K',
  [Tile.R]: 'R',
  [Tile.O]: 'O',
  [Tile.Z]: 'Z',
  [Tile.OWall1]: '█',
  [Tile.OWall2]: '█',
  [Tile.OWall3]: '█',
  [Tile.CWall1]: FLOOR_CHAR,
  [Tile.CWall2]: FLOOR_CHAR,
  [Tile.CWall3]: FLOOR_CHAR,
  [Tile.OSpell1]: FLOOR_CHAR,
  [Tile.OSpell2]: FLOOR_CHAR,
  [Tile.OSpell3]: FLOOR_CHAR,
  [Tile.CSpell1]: FLOOR_CHAR,
  [Tile.CSpell2]: FLOOR_CHAR,
  [Tile.CSpell3]: FLOOR_CHAR,
  [Tile.GBlock]: '▓',
  [Tile.Rock]: 'O',
  [Tile.EWall]: 'X',
  [Tile.Trap5]: FLOOR_CHAR,
  [Tile.TBlock]: FLOOR_CHAR,
  [Tile.TRock]: FLOOR_CHAR,
  [Tile.TGem]: FLOOR_CHAR,
  [Tile.TBlind]: FLOOR_CHAR,
  [Tile.TWhip]: FLOOR_CHAR,
  [Tile.TGold]: FLOOR_CHAR,
  [Tile.TTree]: FLOOR_CHAR,
  [Tile.Rope]: '│',
  [Tile.DropRope]: '↓',
  [Tile.DropRope2]: '↓',
  [Tile.DropRope3]: '↓',
  [Tile.DropRope4]: '↓',
  [Tile.DropRope5]: '↓',
  [Tile.Amulet]: '♀',
  [Tile.ShootRight]: '→',
  [Tile.ShootLeft]: '←',

  [Tile.Trap6]: FLOOR_CHAR,
  [Tile.Trap7]: FLOOR_CHAR,
  [Tile.Trap8]: FLOOR_CHAR,
  [Tile.Trap9]: FLOOR_CHAR,
  [Tile.Trap10]: FLOOR_CHAR,
  [Tile.Trap11]: FLOOR_CHAR,
  [Tile.Trap12]: FLOOR_CHAR,
  [Tile.Trap13]: FLOOR_CHAR,

  [Tile.Message]: '♣',
};

export const MapLookup: Record<string, Tile> = {
  ' ': Tile.Floor,
  '1': Tile.Slow,
  '2': Tile.Medium,
  '3': Tile.Fast,
  X: Tile.Block,
  W: Tile.Whip,
  L: Tile.Stairs,
  C: Tile.Chest,
  S: Tile.SlowTime,
  '+': Tile.Gem,
  I: Tile.Invisible,
  T: Tile.Teleport,
  K: Tile.Key,
  D: Tile.Door,
  '#': Tile.Wall,
  F: Tile.SpeedTime,
  '.': Tile.Trap,
  R: Tile.River,
  Q: Tile.Power,
  '/': Tile.Forest,
  '\\': Tile.Tree,
  '♣': Tile.Tree,
  B: Tile.Bomb,
  V: Tile.Lava,
  '=': Tile.Pit,
  A: Tile.Tome,
  U: Tile.Tunnel,
  Z: Tile.Freeze,
  '*': Tile.Nugget,
  E: Tile.Quake,
  ';': Tile.IBlock,
  ':': Tile.IWall,
  '`': Tile.IDoor,
  '-': Tile.Stop,
  '@': Tile.Trap2,
  '%': Tile.Zap,
  ']': Tile.Create,
  G: Tile.Generator,
  ')': Tile.Trap3,
  M: Tile.MBlock,
  '(': Tile.Trap4,
  P: Tile.Player,
  '&': Tile.ShowGems,
  '!': Tile.Tablet,
  O: Tile.ZBlock,
  H: Tile.BlockSpell,
  '?': Tile.Chance,
  '>': Tile.Statue,
  N: Tile.WallVanish,
  '<': Tile.K,
  '[': Tile.R,
  '|': Tile.O,
  '"': Tile.Z,
  '4': Tile.OWall1,
  '5': Tile.OWall2,
  '6': Tile.OWall3,
  '7': Tile.CWall1,
  '8': Tile.CWall2,
  '9': Tile.CWall3,
  ñ: Tile.OSpell1,
  ò: Tile.OSpell2,
  ó: Tile.OSpell3,
  ô: Tile.CSpell1,
  õ: Tile.CSpell2,
  ö: Tile.CSpell3,
  Y: Tile.GBlock,
  '0': Tile.Rock,
  '~': Tile.EWall,
  $: Tile.Trap5,
  '‘': Tile.TBlock,
  '’': Tile.TRock,
  '“': Tile.TGem,
  '”': Tile.TBlind,
  '•': Tile.TWhip,
  '–': Tile.TGold,
  '—': Tile.TTree,
  '³': Tile.Rope,
  '¹': Tile.DropRope,
  º: Tile.DropRope2,
  '»': Tile.DropRope3,
  '¼': Tile.DropRope4,
  '½': Tile.DropRope5,
  ƒ: Tile.Amulet,
  '¯': Tile.ShootRight,
  '®': Tile.ShootLeft,

  à: Tile.Trap6,
  á: Tile.Trap7,
  â: Tile.Trap8,
  ã: Tile.Trap9,
  ä: Tile.Trap10,
  å: Tile.Trap11,
  æ: Tile.Trap12,
  ç: Tile.Trap13,

  ü: Tile.Message,
};

export const TileColor: Record<Tile, [Color | null, Color | null]> = {
  [Tile.Floor]: [Color.White, Color.Black],
  [Tile.Slow]: [Color.LightRed, null],
  [Tile.Medium]: [Color.LightGreen, null],
  [Tile.Fast]: [Color.Green, null],
  [Tile.Block]: [Color.Brown, null],
  [Tile.Whip]: [Color.HighIntensityWhite, null],
  [Tile.Stairs]: [Color.Black | 16, Color.White],
  [Tile.Chest]: [Color.Yellow, Color.Red],
  [Tile.SlowTime]: [Color.Red, null],
  [Tile.Gem]: [Color.Blue, null],
  [Tile.Invisible]: [Color.Green, null],
  [Tile.Teleport]: [Color.LightMagenta, null],
  [Tile.Key]: [Color.LightRed, null],
  [Tile.Door]: [Color.Magenta, Color.Blue],
  [Tile.Wall]: [Color.Brown, Color.Brown],
  [Tile.SpeedTime]: [Color.LightCyan, null],
  [Tile.Trap]: [Color.White, null],
  [Tile.River]: [Color.LightBlue, Color.Blue],
  [Tile.Power]: [Color.HighIntensityWhite, null],
  [Tile.Forest]: [Color.Green, Color.Green],
  [Tile.Tree]: [Color.Brown, Color.Green],
  [Tile.Bomb]: [Color.HighIntensityWhite, null],
  [Tile.Lava]: [Color.LightRed, Color.Red],
  [Tile.Pit]: [Color.White, null],
  [Tile.Tome]: [Color.HighIntensityWhite | 32, Color.Magenta],
  [Tile.Tunnel]: [Color.HighIntensityWhite, null],
  [Tile.Freeze]: [Color.LightCyan, null],
  [Tile.Nugget]: [Color.Yellow, null], // ArtColor
  [Tile.Quake]: [Color.HighIntensityWhite, null],
  [Tile.IBlock]: [null, null],
  [Tile.IWall]: [null, null],
  [Tile.IDoor]: [null, null],
  [Tile.Stop]: [null, null],
  [Tile.Zap]: [Color.LightRed, null],
  [Tile.Create]: [Color.HighIntensityWhite, null],
  [Tile.Generator]: [Color.Yellow | 16, null], // 30
  [Tile.MBlock]: [Color.Brown, null],
  [Tile.Trap2]: [null, null],
  [Tile.Trap3]: [null, null],
  [Tile.Trap4]: [null, null],
  [Tile.Trap5]: [null, null],
  [Tile.Trap6]: [null, null],
  [Tile.Trap7]: [null, null],
  [Tile.Trap8]: [null, null],
  [Tile.Trap9]: [null, null],
  [Tile.Trap10]: [null, null],
  [Tile.Trap11]: [null, null],
  [Tile.Trap12]: [null, null],
  [Tile.Trap13]: [null, null],
  [Tile.Player]: [Color.Yellow, Color.Black], // 16
  [Tile.ShowGems]: [null, null],
  [Tile.Tablet]: [Color.LightBlue, null],
  [Tile.ZBlock]: [Color.Brown, null],
  [Tile.BlockSpell]: [null, null],
  [Tile.Chance]: [Color.HighIntensityWhite, null],
  [Tile.Statue]: [Color.HighIntensityWhite, null], // 31
  [Tile.K]: [Color.White, null],
  [Tile.R]: [Color.White, null],
  [Tile.O]: [Color.White, null],
  [Tile.Z]: [Color.White, null],
  [Tile.OWall1]: [Color.Brown, Color.Brown],
  [Tile.OWall2]: [Color.Brown, Color.Brown],
  [Tile.OWall3]: [Color.White, Color.Brown],
  [Tile.CWall1]: [null, null],
  [Tile.CWall2]: [null, null],
  [Tile.CWall3]: [null, null],
  [Tile.OSpell1]: [Color.LightCyan, null],
  [Tile.OSpell2]: [Color.LightCyan, null],
  [Tile.OSpell3]: [Color.LightCyan, null],
  [Tile.CSpell1]: [null, null],
  [Tile.CSpell2]: [null, null],
  [Tile.CSpell3]: [null, null],
  [Tile.GBlock]: [Color.White, null],
  [Tile.Rock]: [Color.White, null],
  [Tile.EWall]: [Color.LightRed, Color.Red],
  [Tile.TBlock]: [null, null],
  [Tile.TRock]: [null, null],
  [Tile.TGem]: [null, null],
  [Tile.TBlind]: [null, null],
  [Tile.TWhip]: [null, null],
  [Tile.TGold]: [null, null],
  [Tile.TTree]: [null, null],
  [Tile.WallVanish]: [Color.HighIntensityWhite, null],
  [Tile.Rope]: [Color.White, null],
  [Tile.DropRope]: [Color.White, null],
  [Tile.DropRope2]: [Color.White, null],
  [Tile.DropRope3]: [Color.White, null],
  [Tile.DropRope4]: [Color.White, null],
  [Tile.DropRope5]: [Color.White, null],
  [Tile.ShootRight]: [Color.White, null],
  [Tile.ShootLeft]: [Color.White, null],
  [Tile.Amulet]: [Color.HighIntensityWhite, null], // 31

  [Tile.Message]: [Color.Brown, Color.Green],
};

export const TileMessage: Record<number, string> = {
  [Tile.Block]: 'A Breakable Wall blocks your way',
  [Tile.Whip]: 'You have found a Whip',
  [Tile.Stairs]: 'Stairs take you to the next lower level.',
  [Tile.Chest]: '`You found gems and whips inside the chest!',
  [Tile.SlowTime]: 'You activated a Slow Time spell.',
  [Tile.Gem]: 'Gems give you both points and strength.',
  [Tile.Invisible]: 'Oh no, a temporary Blindness Potion!',
  [Tile.Teleport]: 'You found a Teleport scroll.',
  [Tile.Key]: 'Use Keys to unlock doors.',
  [Tile.Door]: 'To pass the Door you need a Key.',
  [Tile.Wall]: 'A Solid Wall blocks your way.',
  [Tile.River]: 'You cannot travel through Water.',
  [Tile.SpeedTime]: 'You activated a Speed Creature spell.',
  [Tile.Trap]: 'You activated a Teleport trap!',
  [Tile.Power]: 'A Power Ring--your whip is now a little stronger!',
  [Tile.Tree]: 'A tree blocks your way.',
  [Tile.Forest]: 'You cannot travel through forest terrain.',
  [Tile.Bomb]: 'You activated a Magic Bomb!',
  [Tile.Lava]: 'Oooooooooooooooooooh!  Lava hurts!  (Lose 10 Gems.)',
  [Tile.Pit]: '* SPLAT!! *',
  [Tile.Tome]: 'The Sacred Tome of Kroz is finally yours--50,000 points!',
  [Tile.Tunnel]: 'You passed through a secret Tunnel!',
  [Tile.Freeze]: 'You have activated a Freeze Creature spell!',
  [Tile.Nugget]: 'You found a Gold Nugget...500 points!',
  [Tile.Quake]: 'Oh no, you set off an Earthquake trap!',
  [Tile.IBlock]: 'An Invisible Crumbled Wall blocks your way.',
  [Tile.IDoor]: 'An Invisible Door blocks your way.',
  [Tile.Zap]: 'A Creature Zap Spell!',
  [Tile.Create]: 'A Creature Creation Trap!',
  [Tile.Generator]: 'You have discovered a Creature Generator!',
  [Tile.MBlock]: 'A Moving Wall blocks your way.',
  [Tile.ShowGems]: 'Yah Hoo! You discovered a Reveal Gems Scroll!',
  [Tile.Tablet]: 'You found an Ancient Tablet of Wisdom...2,500 points!',
  [Tile.BlockSpell]: 'You triggered Exploding Walls!',
  [Tile.Chance]: 'You found a Pouch containing Gems!',
  [Tile.Statue]: 'Statues are very dangerous...they drain your Gems!',
  [Tile.WallVanish]:
    'Yikes!  A trap has made many of the wall sections invisible!',
  [Tile.OWall1]: 'A Solid Wall blocks your way.',
  [Tile.OSpell1]: 'Magic has been released is this chamber!',
  [Tile.CSpell1]: 'New Walls have magically appeared!',
  [Tile.Rock]: 'You pushed a big Boulder!',
  [Tile.EWall]: 'You hit a Electrified Wall!  You lose one Gem.',
  [Tile.Rope]: 'You grabbed a Rope.',
  [Tile.Amulet]: 'YOUR QUEST FOR THE AMULET WAS SUCCESSFUL!',
};

const MOBS = [Tile.Fast, Tile.Medium, Tile.Slow];
const TBLOCKS = [
  Tile.TBlock,
  Tile.TRock,
  Tile.TGem,
  Tile.TBlind,
  Tile.TWhip,
  Tile.TGold,
  Tile.TTree,
];
const ITRAPS = [
  Tile.Trap2,
  Tile.Trap3,
  Tile.MBlock,
  Tile.Trap4,
  Tile.Trap5,
  224,
  225,
  226,
  227,
  228,
  229,
  230,
  231,
];
const IBLOCKS = [Tile.IBlock, Tile.IWall, Tile.IDoor];
const COLLECTABLES = [Tile.Whip, Tile.Gem, Tile.Teleport];
const SPELLS = [Tile.SlowTime, Tile.Invisible, Tile.SpeedTime, Tile.Freeze];
const CWALLS = [Tile.CWall1, Tile.CWall2, Tile.CWall3];
const CSPELLS = [Tile.CSpell1, Tile.CSpell2, Tile.CSpell3];

export const BOMBABLES = [
  ...MOBS,
  Tile.Block,
  ...IBLOCKS,
  Tile.ZBlock,
  Tile.GBlock,
  ...TBLOCKS,
  Tile.Door,
  Tile.Trap,
  ...ITRAPS,
  Tile.Forest,
  Tile.Quake,
  Tile.Stop,
  Tile.Create,
  Tile.Generator,
  Tile.Chance,
  Tile.K,
  Tile.R,
  Tile.O,
  Tile.Z,
];

export const ROCKABLES = [
  ...MOBS,
  ...COLLECTABLES,
  ...SPELLS,
  Tile.Chest,
  Tile.Trap,
  ...ITRAPS,
  Tile.Stop,
];

export const VISUAL_TELEPORTABLES = [
  Tile.Floor,
  Tile.Stop,
  ...ITRAPS,
  Tile.ShowGems,
  Tile.BlockSpell,
  Tile.WallVanish,
  ...CWALLS,
  ...CSPELLS,
  ...TBLOCKS,
];
