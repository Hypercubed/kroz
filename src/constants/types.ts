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

export const MOBS = [Type.Fast, Type.Medium, Type.Slow]; // 1..3
export const COLLECTABLES = [Type.Whip, Type.Gem, Type.Teleport, Type.Chest]; // 5, 9, 11
export const SPELLS = [
  Type.SlowTime,
  Type.Invisible,
  Type.SpeedTime,
  Type.Freeze
]; // 8, 10, 15, 26

export const ITRAPS = [
  // 33, 37, 39, 67, 224..231
  Type.Trap2,
  Type.Trap3,
  Type.Trap4,
  Type.Trap5,
  Type.Trap6,
  Type.Trap7,
  Type.Trap8,
  Type.Trap9,
  Type.Trap10,
  Type.Trap11,
  Type.Trap12,
  Type.Trap13
];

export const TRAPS = [
  // 16, 33, 37, 39, 67, 224..231
  Type.Trap,
  ...ITRAPS
];

export const KROZ = [
  // 48..51
  Type.K,
  Type.R,
  Type.O,
  Type.Z
];

export const OWALLS = [Type.OWall1, Type.OWall2, Type.OWall3]; // 52..54
export const CWALLS = [Type.CWall1, Type.CWall2, Type.CWall3]; // 55..57
export const OSPELLS = [Type.OSpell1, Type.OSpell2, Type.OSpell3]; // 58..60
export const CSPELLS = [Type.CSpell1, Type.CSpell2, Type.CSpell3]; // 61..63

export const TBLOCKS = [
  // 68..74
  Type.TBlock,
  Type.TRock,
  Type.TGem,
  Type.TBlind,
  Type.TWhip,
  Type.TGold,
  Type.TTree
];

export const ROCKABLES = [
  Type.Floor,
  ...MOBS,
  ...COLLECTABLES,
  ...SPELLS,
  ...TRAPS,
  Type.Stop
];

// Types that can be replaced when a TBlock is triggered
export const TRIGGERABLES = [
  Type.Floor,
  Type.Stop,
  ...ITRAPS,
  Type.ShowGems,
  Type.WallVanish,
  ...TBLOCKS
];

export const ROCK_MOVEABLES = [
  Type.Floor,
  Type.Stop,
  Type.ShowGems,
  Type.BlockSpell,
  Type.WallVanish,
  ...CWALLS,
  ...CSPELLS,
  ...TBLOCKS,
  ...ITRAPS
];

export const ROCK_CRUSHABLES = [
  ...COLLECTABLES,
  Type.SlowTime,
  Type.Invisible,
  Type.Key,
  Type.Trap,
  Type.Power,
  Type.Bomb,
  Type.Freeze,
  Type.Nugget,
  Type.Zap,
  Type.Create,
  Type.Tablet,
  Type.Chance,
  ...KROZ,
  ...OSPELLS,
  Type.ShootRight,
  Type.ShootLeft
];

export const ROCK_CLIFFABLES = [Type.Stairs, Type.Pit];

export const TUNNELABLES = [Type.Floor, Type.Stop, ...ITRAPS, ...CWALLS];

export const MOB_WALKABLE = [
  Type.Floor,
  Type.TBlock,
  Type.TRock,
  Type.TGem,
  Type.TBlind,
  Type.TGold,
  Type.TWhip,
  Type.TTree
];

export const MOB_EATS = [
  Type.Whip,
  Type.Chest,
  Type.SlowTime,
  Type.Gem,
  Type.Invisible,
  Type.Teleport,
  Type.Key,
  Type.SpeedTime,
  Type.Trap,
  Type.Power,
  Type.Freeze,
  Type.Nugget,
  ...KROZ,
  Type.ShootRight,
  Type.ShootLeft
];

export const LAVA_FLOW = [
  Type.Floor,
  ...MOBS,
  Type.Block,
  ...COLLECTABLES,
  ...SPELLS,
  Type.Trap,
  Type.Power,
  Type.Forest,
  Type.Tree,
  Type.Bomb,
  Type.Nugget,
  Type.Quake,
  Type.Stop,
  Type.Trap2,
  Type.Zap,
  Type.Create,
  Type.Trap3,
  Type.MBlock,
  Type.Trap4,
  Type.ShowGems,
  Type.Tablet,
  Type.ZBlock,
  Type.BlockSpell,
  Type.Chance,
  Type.WallVanish,
  ...KROZ,
  Type.CWall3,
  Type.OSpell3,
  Type.GBlock,
  Type.Trap5,
  ...TBLOCKS,
  Type.DropRope2,
  Type.DropRope3,
  Type.DropRope4,
  Type.DropRope5,
  Type.Amulet,
  Type.ShootRight,
  Type.ShootLeft
];

export const TREE_GROW = [
  Type.Floor,
  Type.Trap,
  Type.Nugget,
  Type.Quake,
  Type.Stop,
  Type.Trap2,
  Type.Trap3,
  Type.Trap4
];
