import * as world from './world';
import * as sound from './sound';
import * as screen from './screen';
import * as player from './player-system';
import * as tiles from '../data/tiles';

import {
  createEntityOfType,
  ROCKABLES,
  SPEAR_BLOCKS,
  SPEAR_IGNORE,
  TRIGGERABLES,
  Type,
  VISUAL_TELEPORTABLES,
} from '../data/tiles';
import {
  Breakable,
  isBombable,
  isInvisible,
  isMob,
  isPlayer,
  isSecreted,
  Position,
  Renderable,
} from '../classes/components';
import {
  TIME_SCALE,
  XBot,
  XMax,
  XTop,
  YBot,
  YMax,
  YTop,
} from '../data/constants';
import { RNG } from 'rot-js';
import { delay } from '../utils/utils';
import { Color, ColorCodes } from '../data/colors';
import { Entity } from '../classes/entity';

export const enum Timer { // TODO: Eliminate this, use type
  SlowTime = 4,
  Invisible = 5,
  SpeedTime = 6,
  FreezeTime = 7,
  StatueGemDrain = 9,
}

export const SPELL_DURATION = {
  [Timer.SlowTime]: 70 * TIME_SCALE,
  [Timer.Invisible]: 75 * TIME_SCALE,
  [Timer.SpeedTime]: 80 * TIME_SCALE,
  [Timer.FreezeTime]: 55 * TIME_SCALE,
};

async function hideType(type: Type) {
  await world.level.map.forEach((_x, _y, e) => {
    if (e?.type === type) {
      e.add(isInvisible);
    }
  });
}

export async function updateTilesByType(
  type: Type,
  update: Partial<Renderable>,
) {
  await world.level.map.forEach((_x, _y, e) => {
    if (e?.type === type) {
      if (e.has(Renderable)) {
        const t = e.get(Renderable)!;
        Object.assign(t, update);
      } else {
        e.add(new Renderable(update));
      }
    }
  });
}

export async function shoot(x: number, y: number, dx: number) {
  x += dx;
  while (x >= 0 && x <= XMax) {
    const block = world.level.map.getType(x, y);
    if (typeof block !== 'number' || SPEAR_BLOCKS.includes(block)) {
      // These objects stop the Spear
      break;
    }

    sound.play(x + 30, 10, 100);
    for (let b = 1; b < 6; b++) {
      screen.drawOver(x, y, '─', RNG.getUniformInt(0, 16));
      await delay(1);
    }

    if (!SPEAR_IGNORE.includes(block as number)) {
      // These objects are ignored
      await sound.spearHit();
      if (block === Type.Slow || block === Type.Medium || block === Type.Fast) {
        await world.killAt(x, y);
      }
      world.level.map.setType(x, y, Type.Floor);
    }

    screen.drawEntityAt(x, y);
    x += dx;
  }
  screen.renderPlayfield();
}

export async function bomb(x: number, y: number) {
  sound.bombFuse();

  let d = 0;
  for (; d <= 4; ++d) {
    sound.play(100 - (d * 10) / 4, 4 * 10, 100);

    const x1 = Math.max(x - d, XBot);
    const x2 = Math.min(x + d, XTop);
    const y1 = Math.max(y - d, YBot);
    const y2 = Math.min(y + d, YTop);

    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        screen.drawOver(x, y, '█', Color.LightRed);
        const e = world.level.map.get(x, y);
        if (e?.has(isBombable)) {
          if (e.has(isMob)) {
            world.addScore(e!.type as Type);
            world.killAt(x, y);
          }
        }
      }
    }
    await sound.bomb();
  }
  await delay(100);

  d = 4;
  const x1 = Math.max(x - d, XBot);
  const x2 = Math.min(x + d, XTop);
  const y1 = Math.max(y - d, YBot);
  const y2 = Math.min(y + d, YTop);

  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      const e = world.level.map.get(x, y);
      if (e?.has(isBombable)) {
        world.level.map.setType(x, y, Type.Floor);
      }
    }
  }
  screen.renderPlayfield();
}

export async function quakeTrap() {
  await sound.quakeTrigger();

  await delay(50);
  for (let i = 0; i < 50; i++) {
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if (ROCKABLES.includes(block as number)) {
        world.level.map.setType(x, y, Type.Rock);
        screen.drawEntityAt(x, y);
        break;
      }
    } while (Math.random() > 0.01);

    await sound.quakeRockFall();
  }

  await sound.quakeDone();
}

export async function zapTrap() {
  let t = 0;
  let k = 0;
  while (t < 500 && k < 40) {
    t++;
    const n = RNG.getUniformInt(0, world.level.entities.length);
    const e = world.level.entities[n];
    if (!e) continue;
    const p = e.get(Position)!;
    if (p.x === -1 || p.y === -1) continue; // dead
    if (e.type !== Type.Slow && e.type !== Type.Medium && e.type !== Type.Fast)
      continue;
    await world.killAt(p.x, p.y);
    await delay(20);
    k++;
  }

  world.stats.score += Math.floor(k / 3 + 2);
  screen.renderPlayfield();
  screen.renderStats();
}

export async function createTrap() {
  const SNum = world.level.entities.reduce((acc, e) => {
    if (e.type === Type.Slow) return acc + 1;
    return acc;
  }, 0);
  if (SNum < 945) {
    await world.generateCreatures(45);
  }
}

export async function showGemsSpell() {
  for (let i = 0; i < world.game.difficulty * 2 + 5; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if (block === Type.Floor) {
        done = true;
        world.level.map.setType(x, y, Type.Gem);
        screen.drawEntityAt(x, y);
        await sound.showGem();
        await delay(90);
      }
    } while (!done && Math.random() > 0.01);
  }
}

export async function blockSpell() {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.ZBlock) {
        sound.blockSpell();
        for (let i = 20; i > 0; i--) {
          screen.drawAt(
            x,
            y,
            tiles.common.BLOCK_CHAR,
            RNG.getUniformInt(0, 15),
            0,
          );
        }
        await delay(1);
        world.level.map.setType(x, y, Type.Floor);
        screen.drawEntityAt(x, y);
      } else if (world.level.map.getType(x, y) === Type.BlockSpell) {
        world.level.map.setType(x, y, Type.Floor);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

export async function krozBonus(block: Type) {
  if (block === Type.K && world.level.bonus === 0) world.level.bonus = 1;
  if (block === Type.R && world.level.bonus === 1) world.level.bonus = 2;
  if (block === Type.O && world.level.bonus === 2) world.level.bonus = 3;
  if (block === Type.Z && world.level.bonus === 3) {
    await sound.bonusSound();
    await screen.flashMessage('Super Kroz Bonus -- 10,000 points!');
    world.addScore(block);
  }
}

export async function triggerOSpell(block: Type) {
  let s = Type.OWall1;
  if (block === Type.OSpell2) s = Type.OWall2;
  if (block === Type.OSpell3) s = Type.OWall3;

  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      const block = world.level.map.getType(x, y);
      if (block === s) {
        for (let i = 60; i > 0; i--) {
          screen.drawAt(
            x,
            y,
            RNG.getItem(['▄', '▌', '▐', '▀']) as string,
            RNG.getUniformInt(0, 14),
            0,
          );
          sound.play(i * 40, 5, 10);
          if (i % 5 === 0) await delay(1);
        }
        world.level.map.setType(x, y, Type.Floor);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

export async function triggerCSpell(block: Type) {
  const s = block - Type.CSpell1 + Type.CWall1;

  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      const block = world.level.map.getType(x, y);
      if (block === s) {
        for (let i = 60; i > 0; i--) {
          screen.drawAt(
            x,
            y,
            RNG.getItem(['▄', '▌', '▐', '▀']) as string,
            RNG.getUniformInt(0, 14),
            0,
          );
          sound.play(i * 40, 5, 10);
          if (i % 5 === 0) await delay(1);
        }
        world.level.map.setType(x, y, Type.Wall);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

export async function wallVanish() {
  for (let i = 0; i < 75; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const b = world.level.map.getType(x, y);
      if (b === Type.Block) {
        // TODO: sound
        world.level.map.setType(x, y, Type.IBlock);
        screen.drawEntityAt(x, y);
        done = true;
      }
      if (b === Type.Wall) {
        // TODO: sound
        world.level.map.setType(x, y, Type.IWall);
        screen.drawEntityAt(x, y);
        done = true;
      }
    } while (!done && RNG.getUniformInt(0, 200) !== 0);
  }
}

export async function teleport() {
  await flashPlayer();

  const p = world.level.player.get(Position)!;

  world.level.map.setType(p.x, p.y, Type.Floor);
  screen.drawEntityAt(p.x, p.y);

  // Animation
  const startTime = Date.now();
  for (let i = 0; i < 700; i++) {
    const x = RNG.getUniformInt(0, XMax);
    const y = RNG.getUniformInt(0, YMax);
    const block = world.level.map.getType(x, y);
    if (VISUAL_TELEPORTABLES.indexOf(block as Type) > -1) {
      screen.drawAt(
        x,
        y,
        '☺',
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 7),
      );
      await sound.teleport();
      screen.drawEntityAt(x, y);
    }
    if (Date.now() - startTime > 1500) break;
  }

  const space = world.level.map.findRandomEmptySpace();
  return player.move(...space);
}

export async function flashPlayer() {
  const p = world.level.player.get(Position)!;

  for (let i = 0; i < 160; i++) {
    if (i % 5 === 0) {
      screen.drawAt(
        p.x,
        p.y,
        tiles.common.PLAYER_CHAR,
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 8),
      );
      await delay();
    }
    sound.play(i / 2, 80, 10);
  }
  screen.renderPlayfield();
}

export async function whip() {
  const p = world.level.player.get(Position)!;
  const PX = p.x;
  const PY = p.y;

  sound.whip();
  await hit(PX - 1, PY - 1, '\\');
  await hit(PX - 1, PY, '-');
  await hit(PX - 1, PY + 1, '/');
  await hit(PX, PY + 1, '❘');
  await hit(PX + 1, PY + 1, '\\');
  await hit(PX + 1, PY, '-');
  await hit(PX + 1, PY - 1, '/');
  await hit(PX, PY - 1, '❘');
  screen.renderPlayfield();

  // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER/LOST4.TIT#L399
  async function hit(x: number, y: number, ch: string) {
    if (x < 0 || x > XMax || y < 0 || y > YMax) return;

    const entity = world.level.map.get(x, y);
    const thing = entity?.type || Type.Floor;

    screen.drawOver(x, y, ch, ColorCodes[RNG.getUniformInt(0, 15) as Color]);

    if (entity?.has(isSecreted)) {
      entity?.remove(isSecreted);
      screen.drawEntityAt(x, y);
    }

    if (entity?.has(Breakable)) {
      const b = entity.get(Breakable)!;
      const hardness = b.hardness || 0;
      if (hardness * Math.random() < world.stats.whipPower) {
        if (entity.has(isMob)) {
          // Split into killable?
          world.killAt(x, y);
        }
        world.level.map.setType(x, y, Type.Floor);
        screen.drawEntityAt(x, y);
        const hitSound = b.hitSound || 'WhipHit';
        world.addScore(thing as Type);
        if (hitSound) await sound.triggerSound(hitSound);

        switch (thing) {
          case Type.Statue:
            world.level.T[Timer.StatueGemDrain] = -1;
            await screen.flashMessage(
              `You've destroyed the Statue!  Your Gems are now safe.`,
            );
            break;
          case Type.Generator:
            world.level.genNum--;
            break;
        }
      } else {
        sound.whipMiss();
      }

      screen.renderStats();
    }

    await delay(10);
  }
}

export function replaceEntities(a: Type | string, b: Type | string) {
  const map = world.level.map;
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      if (map.getType(x, y) === a) {
        map.set(x, y, createEntityOfType(b, x, y));
      }
    }
  }
}

export async function processEffect(message: string | undefined, who: Entity) {
  if (!message) return;

  if (typeof message === 'string') {
    const lines = message.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith('##')) {
        await triggerEffect(line.slice(2), who);
      } else if (line.startsWith('@@')) {
        await sound.triggerSound(line.slice(2));
      } else {
        await screen.flashMessage(line);
      }
    }
  }
}

export async function TTrigger(x: number, y: number, block: Type) {
  let t = Type.Floor;
  switch (block) {
    case Type.TBlock:
      t = Type.Block;
      break;
    case Type.TRock:
      t = Type.Rock;
      break;
    case Type.TGem:
      t = Type.Gem;
      break;
    case Type.TBlind:
      t = Type.Invisible;
      break;
    case Type.TWhip:
      t = Type.Whip;
      break;
    case Type.TGold:
      t = Type.Nugget;
      break;
    case Type.TTree:
      t = Type.Tree;
      break;
  }

  for (let b = 0; b < 10; b++) {
    await triggerTrap(false, RNG.getUniformInt(0, 7), RNG.getUniformInt(0, 7));
    await sound.play((b + 25) * b * 2, 20, 10);
  }

  return triggerTrap(true);

  async function triggerTrap(place: boolean, fg?: number, bg?: number) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const b = world.level.map.getType(x + dx, y + dy);
        if (TRIGGERABLES.includes(b as Type)) {
          if (place) {
            world.level.map.setType(x + dx, y + dy, t);
          } else {
            world.level.map.setType(x + dx, y + dy, t);
            const e = world.level.map.get(x + dx, y + dy);
            if (!e) continue;
            const r = e?.get(Renderable);
            if (!r) continue;
            screen.drawAt(x + dx, y + dy, r.ch, fg!, bg!);
          }
        }
        await delay(5);
      }
    }
  }
}

async function disguiseFast() {
  await updateTilesByType(Type.Fast, { ch: '☺' });
  screen.renderPlayfield();
}

async function pitsToRock() {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.Pit) {
        await sound.play(x * y, 50, 10);
        world.level.map.setType(x, y, Type.Rock);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function wallsToGold() {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.CWall1) {
        await sound.play(x * y, 50, 10);
        world.level.map.setType(x, y, Type.Nugget);
        // ArtColor??
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function riverToBlock() {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.River) {
        await sound.play(x * y, 50, 10);
        world.level.map.setType(x, y, Type.Block);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function riverToGold() {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.River) {
        await sound.play(x * y, 50, 10);
        world.level.map.setType(x, y, Type.Nugget);
        screen.drawEntityAt(x, y);
      }
    }
  }
}

async function showIWalls() {
  await world.level.map.forEach(async (x, y, e) => {
    if (e.type === Type.IWall) {
      sound.play(x * y, 1, 10);
      if (y === 0) await delay(2);
      world.level.map.setType(x, y, Type.OWall3);
      screen.drawEntityAt(x, y);
    }
  });
}

function hideLevel() {
  for (let x = 0; x < world.level.map.width; x++) {
    for (let y = 0; y < world.level.map.height; y++) {
      const e = world.level.map.get(x, y)!;
      if (e && !e.has(isPlayer)) {
        e.add(isInvisible);
      }
    }
  }
}

function slowTimeSpell() {
  world.level.T[Timer.SpeedTime] = 0;
  world.level.T[Timer.FreezeTime] = 0;
  world.level.T[Timer.SlowTime] = SPELL_DURATION[Timer.SlowTime];
}

function speedTimeSpell() {
  world.level.T[Timer.SlowTime] = 0;
  world.level.T[Timer.SpeedTime] = SPELL_DURATION[Timer.SpeedTime];
}

function invisibleSpell() {
  world.level.T[Timer.Invisible] = SPELL_DURATION[Timer.Invisible];
  world.level.player.add(isInvisible);

  const p = world.level.player.get(Position)!;
  screen.drawEntityAt(p.x, p.y);
}

function freezeSpell() {
  world.level.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
}

async function HideOpenWall() {
  await hideType(Type.OSpell1);
  await hideType(Type.OSpell2);
  await hideType(Type.OSpell3);
}

/** # Effects */
const EffectMap = {
  Bomb: (x: number, y: number) => bomb(x, y),
  Quake: quakeTrap,
  Trap: () => teleport(),
  Trap2: () => replaceEntities(Type.Trap2, Type.Floor),
  Zap: zapTrap,
  Create: createTrap,
  ShowGems: showGemsSpell,
  BlockSpell: blockSpell,
  WallVanish: wallVanish,
  K: () => krozBonus(Type.K),
  R: () => krozBonus(Type.R),
  O: () => krozBonus(Type.O),
  Z: () => krozBonus(Type.Z),
  OSpell1: () => triggerOSpell(Type.OSpell1),
  OSpell2: () => triggerOSpell(Type.OSpell2),
  OSpell3: () => triggerOSpell(Type.OSpell3),
  CSpell1: () => triggerCSpell(Type.CSpell1),
  CSpell2: () => triggerCSpell(Type.CSpell2),
  CSpell3: () => triggerCSpell(Type.CSpell3),
  Trap3: () => replaceEntities(Type.Trap3, Type.Floor),
  Trap4: () => replaceEntities(Type.Trap4, Type.Floor),
  Trap5: () => replaceEntities(Type.Trap5, Type.Floor),
  Trap6: () => replaceEntities(Type.Trap6, Type.Floor),
  Trap7: () => replaceEntities(Type.Trap7, Type.Floor),
  Trap8: () => replaceEntities(Type.Trap8, Type.Floor),
  Trap9: () => replaceEntities(Type.Trap9, Type.Floor),
  Trap10: () => replaceEntities(Type.Trap10, Type.Floor),
  Trap11: () => replaceEntities(Type.Trap11, Type.Floor),
  Trap12: () => replaceEntities(Type.Trap12, Type.Floor),
  Trap13: () => replaceEntities(Type.Trap13, Type.Floor),
  TBlock: (x: number, y: number) => TTrigger(x, y, Type.TBlock),
  TRock: (x: number, y: number) => TTrigger(x, y, Type.TRock),
  TGem: (x: number, y: number) => TTrigger(x, y, Type.TGem),
  TBlind: (x: number, y: number) => TTrigger(x, y, Type.TBlind),
  TWhip: (x: number, y: number) => TTrigger(x, y, Type.TWhip),
  TGold: (x: number, y: number) => TTrigger(x, y, Type.TGold),
  TTree: (x: number, y: number) => TTrigger(x, y, Type.TTree),
  ShootRight: (x: number, y: number) => shoot(x, y, 1),
  ShootLeft: (x: number, y: number) => shoot(x, y, -1),
  /** ## HideStairs */
  HideGems: () => hideType(Type.Gem),
  /** ## HideRocks */
  HideRocks: () => hideType(Type.Rock),
  /** ## HideStairs */
  HideStairs: () => hideType(Type.Stairs),
  /** ## HideOpenWall */
  HideOpenWall: HideOpenWall,
  /** ## HideCreate */
  HideCreate: () => hideType(Type.Create),
  /** ## HideMBlock */
  HideMBlock: () => hideType(Type.MBlock),
  /** ## HideTrap */
  HideTrap: () => hideType(Type.Trap),
  SlowTime: slowTimeSpell,
  SpeedTime: speedTimeSpell,
  Invisible: invisibleSpell,
  Freeze: freezeSpell,
  /** ## HideLevel */
  HideLevel: hideLevel,
  ShowIWalls: showIWalls,
  /** ## RiverToGold */
  RiverToGold: riverToGold,
  /** ## RiverToBlock */
  RiverToBlock: riverToBlock,
  /** ## WallsToGold */
  WallsToGold: wallsToGold,
  /** ## WallsToGold */
  PitsToRock: pitsToRock,
  /** ## DisguiseFast */
  DisguiseFast: disguiseFast,
  FlashPlayer: flashPlayer,
};

export async function triggerEffect(trigger: string, who: Entity) {
  if (EffectMap[trigger as keyof typeof EffectMap]) {
    const p = who.get(Position);
    await EffectMap[trigger as keyof typeof EffectMap](p?.x || 0, p?.y || 0);
    return;
  }
  console.warn('Unknown effect:', trigger);
}
