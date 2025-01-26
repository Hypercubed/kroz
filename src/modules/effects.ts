import * as world from './world';
import * as sound from './sound';
import * as screen from './screen';

import {
  BOMBABLES,
  createEntityOfType,
  ROCKABLES,
  SPEAR_BLOCKS,
  SPEAR_IGNORE,
  TRIGGERABLES,
  Type,
  VISUAL_TELEPORTABLES,
} from '../data/tiles';
import {
  isInvisible,
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

export async function specialTriggers(t: string) {
  // TODO: #CHANGE(INVISIBLE_SOLID_WALL,SOLID_WALL)
  // #GIVE(SCORE,25000)
  // #ITEMEFFECT(OPEN_SPELL1)
  // #SETLEVELFEATURE(WaterFlow,1)

  switch (t) {
    case '##HideGems':
      await hideType(Type.Gem);
      break;
    case '##HideRocks':
      await hideType(Type.Rock);
      break;
    case '##HideStairs':
      await hideType(Type.Stairs);
      break;
    case '##HideOpenWall':
      // be careful with this one, name is confusing
      // hides the open wall spell, not the wall itself
      await hideType(Type.OSpell1);
      await hideType(Type.OSpell2);
      await hideType(Type.OSpell3);
      break;
    case '##HideCreate':
      await hideType(Type.Create);
      break;
    case '##HideMBlock':
      await hideType(Type.MBlock);
      break;
    case '##HideTrap':
      await hideType(Type.Trap);
      break;
    case '##HideLevel':
      for (let x = 0; x < world.level.map.width; x++) {
        for (let y = 0; y < world.level.map.height; y++) {
          const e = world.level.map.get(x, y)!;
          if (e && !e.has(isPlayer)) {
            e.add(isInvisible);
          }
        }
      }
      break;
    case '##ShowIWalls':
      await world.level.map.forEach(async (x, y, e) => {
        if (e.type === Type.IWall) {
          sound.play(x * y, 1, 10);
          // await delay(1);
          world.level.map.setType(x, y, Type.OWall3);
          screen.drawEntity(x, y);
        }
      });
      break;
    case '##RiverToGold':
      for (let x = 0; x <= XMax; x++) {
        for (let y = 0; y <= YMax; y++) {
          if (world.level.map.getType(x, y) === Type.River) {
            await sound.play(x * y, 50, 10);
            world.level.map.setType(x, y, Type.Nugget);
            screen.drawEntity(x, y);
          }
        }
      }
      break;
    case '##RiverToBlock':
      for (let x = 0; x <= XMax; x++) {
        for (let y = 0; y <= YMax; y++) {
          if (world.level.map.getType(x, y) === Type.River) {
            await sound.play(x * y, 50, 10);
            world.level.map.setType(x, y, Type.Block);
            screen.drawEntity(x, y);
          }
        }
      }
      break;
    case '##WallsToGold':
      for (let x = 0; x <= XMax; x++) {
        for (let y = 0; y <= YMax; y++) {
          if (world.level.map.getType(x, y) === Type.CWall1) {
            await sound.play(x * y, 50, 10);
            world.level.map.setType(x, y, Type.Nugget);
            // ArtColor??
            screen.drawEntity(x, y);
          }
        }
      }
      break;
    case '##PitsToRock':
      for (let x = 0; x <= XMax; x++) {
        for (let y = 0; y <= YMax; y++) {
          if (world.level.map.getType(x, y) === Type.Pit) {
            await sound.play(x * y, 50, 10);
            world.level.map.setType(x, y, Type.Rock);
            screen.drawEntity(x, y);
          }
        }
      }
      break;
    case '##OSpell1':
      await triggerOSpell(Type.OSpell1);
      await screen.flashTypeMessage(Type.OSpell1, true);
      break;
    case '##DisguiseFast':
      await updateTilesByType(Type.Fast, { ch: '☺' });
      screen.renderPlayfield();
      break;
    case '##FlashPlayer':
      flashPlayer();
      break;
  }
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

    screen.drawEntity(x, y);
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
        const block = (world.level.map.getType(x, y) as number) ?? Type.Floor;
        if (BOMBABLES.includes(block as number)) {
          if (block >= 1 && block <= 4) {
            world.addScore(block);
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
      const block = (world.level.map.getType(x, y) as number) ?? Type.Floor;
      if (BOMBABLES.includes(block as number)) {
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
        screen.drawEntity(x, y);
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
        screen.drawEntity(x, y);
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
          screen.drawType(x, y, Type.Block, RNG.getUniformInt(0, 15));
        }
        await delay(1);
        world.level.map.setType(x, y, Type.Floor);
        screen.drawEntity(x, y);
      } else if (world.level.map.getType(x, y) === Type.BlockSpell) {
        world.level.map.setType(x, y, Type.Floor);
        screen.drawEntity(x, y);
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
    world.addScore(block);
    await screen.flashTypeMessage(block);
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
          screen.drawType(
            x,
            y,
            RNG.getItem(['▄', '▌', '▐', '▀']) as string,
            RNG.getUniformInt(0, 14),
          );
          sound.play(i * 40, 5, 10);
          if (i % 5 === 0) await delay(1);
        }
        world.level.map.setType(x, y, Type.Floor);
        screen.drawEntity(x, y);
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
          screen.drawType(
            x,
            y,
            RNG.getItem(['▄', '▌', '▐', '▀']) as string,
            RNG.getUniformInt(0, 14),
          );
          sound.play(i * 40, 5, 10);
          if (i % 5 === 0) await delay(1);
        }
        world.level.map.setType(x, y, Type.Wall);
        screen.drawEntity(x, y);
      }
    }
  }
}

export async function triggers(x: number, y: number, block: Type) {
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
          screen.drawType(x + dx, y + dy, t, fg, bg);
          if (place) world.level.map.setType(x + dx, y + dy, t);
        }
        await delay(5);
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
        screen.drawEntity(x, y);
        done = true;
      }
      if (b === Type.Wall) {
        // TODO: sound
        world.level.map.setType(x, y, Type.IWall);
        screen.drawEntity(x, y);
        done = true;
      }
    } while (!done && RNG.getUniformInt(0, 200) !== 0);
  }
}

export async function teleport() {
  await flashPlayer();

  const p = world.level.player.get(Position)!;

  world.level.map.setType(p.x, p.y, Type.Floor);
  screen.drawEntity(p.x, p.y);

  // Animation
  const startTime = Date.now();
  for (let i = 0; i < 700; i++) {
    const x = RNG.getUniformInt(0, XMax);
    const y = RNG.getUniformInt(0, YMax);
    const block = world.level.map.getType(x, y);
    if (VISUAL_TELEPORTABLES.indexOf(block as Type) > -1) {
      screen.drawType(
        x,
        y,
        '☺',
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 7),
      );
      await sound.teleport();
      screen.drawType(x, y, block);
    }
    if (Date.now() - startTime > 1500) break;
  }

  // Teleport
  return world.level.map.findRandomEmptySpace();
}

export async function flashPlayer() {
  const p = world.level.player.get(Position)!;

  for (let i = 0; i < 160; i++) {
    if (i % 5 === 0) {
      screen.drawType(
        p.x,
        p.y,
        Type.Player,
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

  // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER/LOST4.TIT#L399
  async function hit(x: number, y: number, ch: string) {
    if (x < 0 || x > XMax || y < 0 || y > YMax) return;

    const entity = world.level.map.get(x, y);
    const thing = entity?.type || Type.Floor;

    screen.drawOver(x, y, ch, ColorCodes[RNG.getUniformInt(0, 15) as Color]);

    if (entity?.has(isSecreted)) {
      entity?.remove(isSecreted);
      screen.drawEntity(x, y);
    }

    // TODO: use lists
    switch (thing) {
      case Type.Slow: // Kill
      case Type.Medium:
      case Type.Fast:
        world.killAt(x, y);
        world.addScore(thing);
        break;
      case Type.Block:
      case Type.Forest:
      case Type.Tree:
      case Type.Message:
      case Type.MBlock:
      case Type.ZBlock:
      case Type.GBlock: {
        // Destroy?
        const w = world.stats.whipPower;
        if (6 * Math.random() < w) {
          if (thing === Type.MBlock) world.killAt(x, y);
          world.level.map.setType(x, y, Type.Floor);
          screen.drawEntity(x, y);
          screen.drawOver(
            x,
            y,
            ch,
            ColorCodes[RNG.getUniformInt(0, 15) as Color],
          );
          sound.whipHit();
        } else {
          sound.whipMiss();
        }
        break;
      }
      case Type.Invisible:
      case Type.SpeedTime:
      case Type.Trap:
      case Type.Power:
      case Type.K:
      case Type.R:
      case Type.O:
      case Type.Z: // Break
        world.level.map.setType(x, y, Type.Floor);
        sound.whipBreak();
        // TODO: Generator special case
        break;
      // case Type.Quake:
      // case Type.IBlock:
      // case Type.IWall:
      // case Type.IDoor:
      // case Type.Trap2:
      // case Type.Trap3:
      // case Type.Trap4:
      // case Type.ShowGems:
      // case Type.BlockSpell:
      // case Type.Trap5:
      // case Type.Trap6:
      // case Type.Trap7:
      // case Type.Trap8:
      // case Type.Trap9:
      // case Type.Trap10:
      // case Type.Trap11:
      // case Type.Trap12:
      // case Type.Trap13:
      // case Type.Stop:
      //   // No break, no effect
      //   break;
      case Type.Rock:
        if (30 * Math.random() < world.stats.whipPower) {
          sound.whipBreakRock();
          world.level.map.setType(x, y, Type.Floor);
        } else {
          sound.whipMiss();
        }
        break;
      case Type.Statue:
        // TODO: Sound
        if (50 * Math.random() < world.stats.whipPower) {
          // TODO: Sound
          world.level.map.setType(x, y, Type.Floor);
          world.addScore(thing);
          world.level.T[Timer.StatueGemDrain] = -1;
          await screen.flashMessage(
            `You've destroyed the Statue!  Your Gems are now safe.`,
          );
        } else {
          sound.whipMiss();
        }
        break;
      case Type.Generator:
        // TODO: Sound
        world.addScore(thing);
        world.level.map.setType(x, y, Type.Floor);
        world.level.genNum--;
        break;
      // case Type.Wall:
      //   break;
      default:
        break;
    }

    screen.renderStats();
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

export async function readMessage(message: string | undefined) {
  if (!message) return;

  if (typeof message === 'string') {
    const lines = message.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith('##')) {
        await specialTriggers(line);
      } else if (line.startsWith('@@')) {
        await specialSounds(line);
      } else {
        await screen.flashMessage(line);
      }
    }
  }
}

async function specialSounds(t: string) {
  switch (t) {
    case '@@Amulet':
      await sound.amulet();
      break;
    case '@@SecretMessage':
      await sound.secretMessage();
      break;
  }
}
