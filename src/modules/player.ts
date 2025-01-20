import { default as RNG } from 'rot-js/lib/rng';

import * as controls from './controls.ts';
import * as display from './display.ts';
import * as sound from './sound.ts';
import * as screen from './screen.ts';
import * as world from './world.ts';
import * as levels from './levels.ts';

import {
  Type,
  BOMBABLES,
  ROCKABLES,
  VISUAL_TELEPORTABLES,
  MOBS,
  TRIGGERABLES,
  ROCK_MOVEABLES,
  ROCK_CRUSHABLES,
  ROCK_CLIFFABLES,
  TUNNELABLES,
  SPEAR_BLOCKS,
  SPEAR_IGNORE,
  createEntityOfType,
} from '../data/tiles.ts';
import {
  TIME_SCALE,
  XBot,
  XMax,
  XTop,
  YBot,
  YMax,
  YTop,
} from '../data/constants.ts';
import { Action } from './controls.ts';

import { Color, ColorCodes } from '../data/colors.ts';
import { clamp, delay } from '../utils/utils.ts';
import { LEVELS } from './levels.ts';
import dedent from 'ts-dedent';
import { Timer } from './world.ts';
import {
  AttacksPlayer,
  Collectible,
  isSecreted,
  isInvisible,
  MagicTrigger,
  Position,
  Walkable,
  isPushable,
  isPlayer,
} from '../classes/components.ts';
import { Entity } from '../classes/entity.ts';

const SPELL_DURATION = {
  [Timer.SlowTime]: 70 * TIME_SCALE,
  [Timer.Invisible]: 75 * TIME_SCALE,
  [Timer.SpeedTime]: 80 * TIME_SCALE,
  [Timer.FreezeTime]: 55 * TIME_SCALE,
};

export async function update() {
  // Debug Actions
  if (controls.wasActionDeactivated(Action.NextLevel))
    return await levels.nextLevel();
  if (controls.wasActionDeactivated(Action.PrevLevel))
    return await levels.prevLevel();

  if (controls.wasActionDeactivated(Action.NextLevelCheat)) {
    const p = world.level.player.get(Position)!;
    world.level.map.setType(p.x + 1, p.y, Type.Stairs);
    await sound.cheat();
    return;
  }

  if (controls.wasActionDeactivated(Action.FreeItems)) {
    world.stats.gems = 150;
    world.stats.whips = 99;
    world.stats.teleports = 99;
    world.stats.keys = 9;
    screen.renderStats();
    return;
  }

  if (controls.wasActionDeactivated(Action.SlowerClock)) {
    world.game.clockScale = Math.min(20, world.game.clockScale + 1);
    console.log('Clock Scale:', world.game.clockScale);
    return;
  }

  if (controls.wasActionDeactivated(Action.FasterClock)) {
    world.game.clockScale = Math.max(1, world.game.clockScale - 1);
    console.log('Clock Scale:', world.game.clockScale);
    return;
  }

  // Player Actions
  if (controls.wasActionDeactivated(Action.ResetFound)) {
    world.game.foundSet = new Set();
    await screen.flashMessage('Newly found object descriptions are reset.');
    return;
  }
  if (controls.wasActionDeactivated(Action.HideFound)) {
    world.game.foundSet = true;
    await screen.flashMessage(
      'References to new objects will not be displayed.',
    );
    return;
  }

  // Game Actions
  if (controls.wasActionDeactivated(Action.Pause)) return pause();
  if (controls.wasActionDeactivated(Action.Quit)) return quit();
  if (controls.wasActionDeactivated(Action.Save)) return world.save();
  if (controls.wasActionDeactivated(Action.Restore)) return world.restore();

  // Whip can happen at any time (no return)
  if (controls.wasActionActive(Action.Whip)) {
    if (world.stats.whips < 1) {
      sound.noneSound();
    } else {
      world.stats.whips--;
      await whip();
    }
  }

  if (controls.wasActionActive(Action.Teleport)) {
    if (world.stats.teleports < 1) {
      await sound.noneSound();
    } else {
      world.stats.teleports--;
      await teleport();
    }
  }

  // Player Movement
  let dx = 0;
  let dy = 0;

  if (controls.wasActionActive(Action.North)) dy--;
  if (controls.wasActionActive(Action.South)) dy++;
  if (controls.wasActionActive(Action.West)) dx--;
  if (controls.wasActionActive(Action.East)) dx++;

  if (controls.wasActionActive(Action.Southeast)) {
    dx++;
    dy++;
  }
  if (controls.wasActionActive(Action.Southwest)) {
    dx--;
    dy++;
  }
  if (controls.wasActionActive(Action.Northeast)) {
    dx++;
    dy--;
  }
  if (controls.wasActionActive(Action.Northwest)) {
    dx--;
    dy--;
  }

  dx = clamp(dx, -1, 1);
  dy = clamp(dy, -1, 1);

  if (dx !== 0 || dy !== 0) {
    await tryMove(dx, dy);
  }
}

export async function tryMove(dx: number, dy: number) {
  const p = world.level.player.get(Position)!;
  const x = p.x + dx;
  const y = p.y + dy;

  if (x < 0 || x > XMax || y < 0 || y > YMax) {
    await sound.staticNoise();
    world.addScore(Type.Border);
    await screen.flashTypeMessage(Type.Border, true);
    return;
  }

  const e = world.level.map.get(x, y);
  if (!e) return;

  const block = world.level.map.getType(x, y) || Type.Floor;

  if (e?.has(AttacksPlayer)) {
    const damage = e.get(AttacksPlayer)!.damage;
    world.stats.gems -= damage;
    world.killAt(x, y);
    world.addScore(e.type as Type);
    move(x, y);
    return;
  }

  if (e?.has(Collectible)) {
    sound.grab(); // TODO: Chest sound
    const collect = e.get(Collectible)!;

    world.stats.whips += collect.whips;
    world.stats.gems += collect.gems;
    world.stats.teleports += collect.teleports;
    world.stats.keys += collect.keys;
    world.stats.whipPower += collect.whipPower;

    world.addScore(block as Type);
    move(x, y);

    switch (block) {
      case Type.Chest:
        await screen.flashMessage(
          `You found ${collect.gems} gems and ${collect.whips} whips inside the chest!`,
        );
        break;
      case Type.Chance:
        await screen.flashMessage(
          `You found a Pouch containing ${collect.gems} Gems!`,
        );
        break;
      default:
        await screen.flashTypeMessage(block as Type, true);
        break;
    }

    return;
  }

  if (e?.has(MagicTrigger)) {
    move(x, y);
    await trigger(e.get(MagicTrigger)!.type, x, y);
    return;
  }

  if (e?.get(Walkable)?.by(Type.Player)) {
    move(x, y);
    return;
  }

  if (e?.has(isPushable)) {
    await pushRock(e, x, y, dx, dy);
    return;
  }

  switch (block) {
    case Type.Wall: // Blocked -> isBlock Component
    case Type.River:
    case Type.Block:
    case Type.ZBlock:
    case Type.GBlock:
      sound.blockedWall();
      world.addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Tree: // Blocked -> isBlock Component?
    case Type.Forest:
    case Type.Generator:
    case Type.MBlock:
      world.addScore(block);
      await sound.blocked(); // TODO: replace this sound
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Stairs: // Next level -> isStairs Component?
      move(x, y);
      if (world.stats.levelIndex === LEVELS.length - 1) {
        await endRoutine();
        return;
      }
      world.addScore(block);
      await screen.flashTypeMessage(Type.Stairs, true);
      sound.footStep();
      await levels.nextLevel();
      break;
    case Type.Door: // Opens door (if has key) -> isDoor Component?
      if (world.stats.keys < 1) {
        sound.locked();
        await delay(100);
        await screen.flashMessage('To pass the Door you need a Key.');
      } else {
        world.stats.keys--;
        world.addScore(block);
        await sound.openDoor();
        move(x, y);
        screen.renderPlayfield();
        await screen.flashTypeMessage(Type.Door, true);
      }
      // TODO: LOST 75 special case
      break;
    case Type.Lava: // Moves + Damage -> Damage Component?
      world.stats.gems -= 10;
      world.addScore(block);
      move(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Pit: // Moves + Kills -> Kills Component?
      move(x, y);
      world.stats.gems = -1; // dead
      await screen.flashTypeMessage(block);
      break;
    case Type.Tome: // -> Read Component?
      // TODO: Tome_Message;

      world.level.map.setType(31, 6, Type.Stairs);
      screen.drawType(31, 6, Type.Stairs);

      world.addScore(block);
      await screen.flashTypeMessage(block);
      await screen.flashMessage(
        'Congratulations, Adventurer, you finally did it!!!',
      );
      break;
    case Type.Tunnel: {
      // -> isTunnel Component?
      // Goes through tunnel
      // Player starting position
      const p = world.level.player.get(Position)!;
      const sx = p.x;
      const sy = p.y;

      move(x, y);
      await tunnel(x, y, sx, sy);
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.IBlock: // IBlock is replaced by Block -> SwapOnTouch Component?
      sound.blockedWall();
      world.level.map.setType(x, y, Type.Block);
      screen.drawEntity(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.IWall: // IBlock is replaced by Wall -> SwapOnTouch Component?
      sound.blockedWall();
      world.level.map.setType(x, y, Type.Wall);
      screen.drawEntity(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.IDoor: // IDoor is replaced by Door -> SwapOnTouch Component?
      sound.blockedWall();
      world.level.map.setType(x, y, Type.Door);
      screen.drawEntity(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Tablet: // Reads tablet -> Read Component?
      move(x, y);
      sound.grab();
      world.addScore(block);
      await screen.flashTypeMessage(block, true);
      await readMessage(world.level.tabletMessage);
      break;
    case Type.Statue: // Blocked
      sound.blocked();
      await screen.flashTypeMessage(block);
      break;
    case Type.OWall1: // Blocked
    case Type.OWall2:
    case Type.OWall3:
      sound.blockedWall();
      world.addScore(Type.Wall);
      await screen.flashTypeMessage(Type.OWall1, true);
      break;
    case Type.EWall: // Damage -> Damage Component?
      world.addScore(block);
      world.stats.gems--;
      sound.staticNoise();
      await screen.flashTypeMessage(Type.EWall, true);
      break;
    case Type.Message: // Reads message -> Read Component?
      // Reads secret message
      await secretMessage();
      break;
    case Type.Amulet: // Reads message -> Read Component?
      move(x, y);
      await gotAmulet();
      break;
    default:
      sound.blockedWall();
      break;
  }
}

function replaceEntities(a: Type | string, b: Type | string) {
  const map = world.level.map;
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      if (map.getType(x, y) === a) {
        map.set(x, y, createEntityOfType(b, x, y));
      }
    }
  }
}

async function whip() {
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

async function teleport() {
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
  move(...world.level.map.findRandomEmptySpace());
}

export async function dead() {
  display.drawText(XTop / 2 - 7, 0, 'You have died.', Color.Black, Color.Red);
  await screen.flashMessage('Press any key to continue.');
  world.game.done = true;
}

async function quit() {
  let answer = '';

  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n') {
    answer = await screen.flashMessage('Are you sure you want to quit? (Y/N)');
  }

  if (answer.toLowerCase() === 'y') {
    world.game.done = true;
  }
}

async function pause() {
  await screen.flashMessage('Press any key to resume');
}

export async function readMessage(message: string | undefined) {
  if (!message) return;

  if (typeof message === 'string') {
    const messages = message.split('\n');
    for (const message of messages) {
      if (!message) continue;

      if (message.startsWith('##')) {
        await specialTriggers(message.slice(2));
      } else {
        await screen.flashMessage(message);
      }
    }
  }
}

export async function endRoutine() {
  await sound.footStep();
  await delay(200);
  await sound.footStep();
  await delay(200);
  await sound.footStep();

  await screen.flashMessage('Oh no, something strange is happening!');
  await screen.flashMessage('You are magically transported from Kroz!');

  // Check for infinite items
  const gems = (world.stats.gems = isFinite(world.stats.gems)
    ? world.stats.gems
    : 150);
  const whips = (world.stats.whips = isFinite(world.stats.whips)
    ? world.stats.whips
    : 20);
  const teleports = (world.stats.teleports = isFinite(world.stats.teleports)
    ? world.stats.teleports
    : 10);
  const keys = (world.stats.keys = isFinite(world.stats.keys)
    ? world.stats.keys
    : 5);

  await screen.flashMessage('Your Gems are worth 100 points each...');

  for (let i = 0; i < gems; i++) {
    world.stats.gems--;
    world.stats.score += 10;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage('Your Whips are worth 100 points each...');
  for (let i = 0; i < whips; i++) {
    world.stats.whips--;
    world.stats.score += 10;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage(
    'Your Teleport Scrolls are worth 200 points each...',
  );
  for (let i = 0; i < teleports; i++) {
    world.stats.teleports--;
    world.stats.score += 20;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage('Your Keys are worth 10,000 points each....');
  for (let i = 0; i < keys; i++) {
    world.stats.keys--;
    world.stats.score += 1000;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  display.clear(Color.Blue);

  display.drawText(25, 3, 'ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ', Color.White, Color.Blue);

  display.drawText(
    10,
    5,
    dedent`
        Carefully, you place the ancient tome on your table and open
        to the first page.  You read the book intently, quickly
        deciphering the archaic writings.

        You learn of Lord Dullwit, the once powerful and benevolent
        ruler of Kroz, who sought wealth and education for his people.
        The magnificent KINGDOM OF KROZ was once a great empire, until
        it was overthrown by an evil Wizard, who wanted the riches of
        Kroz for himself.

        Using magic beyond understanding, the Wizard trapped Lord
        Dullwit and his people in a chamber so deep in Kroz that any
        hope of escape was fruitless.

        The Wizard then built hundreds of deadly chambers that would
        stop anyone from ever rescuing the good people of Kroz.
        Once again your thoughts becomes clear:  To venture into the
        depths once more and set free the people of Kroz.
       `,
    Color.White,
    Color.Blue,
  );

  await screen.flashMessage('Press any key, Adventurer.');
  world.game.done = true;
}

async function shoot(x: number, y: number, dx: number) {
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

async function gotAmulet() {
  await sound.grab();
  await sound.amulet();
  world.addScore(Type.Amulet);
  await readMessage(dedent`
    You have found the Amulet of Yendor -- 25,000 points!
    It seems that Kroz and Rogue share the same underground!)
    Your quest for the treasure of Kroz must still continue...
  `);
}

async function bomb(x: number, y: number) {
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

async function tunnel(x: number, y: number, sx: number, sy: number) {
  await delay(350);
  await sound.footStep();
  await delay(500);
  world.level.map.setType(x, y, Type.Tunnel);
  screen.drawEntity(x, y);

  // Find a random tunnel
  let tx = x;
  let ty = y;
  for (let i = 0; i < 10000; i++) {
    const a = RNG.getUniformInt(0, XMax);
    const b = RNG.getUniformInt(0, YMax);
    const t = world.level.map.getType(a, b) ?? Type.Floor;
    if (t === Type.Tunnel && (a !== tx || b !== ty)) {
      tx = a;
      ty = b;
      move(tx, ty);
      break;
    }
  }

  world.level.map.setType(x, y, Type.Tunnel);
  screen.drawEntity(x, y);

  // Find a random empty space near exit
  let ex = sx;
  let ey = sy;
  for (let i = 0; i < 100; i++) {
    const a = RNG.getUniformInt(-1, 1);
    const b = RNG.getUniformInt(-1, 1);
    if (tx + a < 0 || tx + a > XMax || ty + b < 0 || ty + b > YMax) continue;
    const e = world.level.map.getType(tx + a, ty + b) ?? Type.Floor;
    if (TUNNELABLES.includes(e as Type)) {
      ex = tx + a;
      ey = ty + b;
      break;
    }
  }
  move(ex, ey);
  world.level.map.setType(tx, ty, Type.Tunnel);
  screen.drawEntity(tx, ty);
}

async function quakeTrap() {
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

async function zapTrap() {
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

async function createTrap() {
  const SNum = world.level.entities.reduce((acc, e) => {
    if (e.type === Type.Slow) return acc + 1;
    return acc;
  }, 0);
  if (SNum < 945) {
    await world.generateCreatures(45);
  }
}

async function showGemsSpell() {
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

async function blockSpell() {
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.ZBlock) {
        sound.blockSpell();
        for (let i = 20; i > 0; i--) {
          screen.drawType(x, y, Type.Block, RNG.getUniformInt(0, 15));
          await delay(1);
        }
        world.level.map.setType(x, y, Type.Floor);
        screen.drawEntity(x, y);
      } else if (world.level.map.getType(x, y) === Type.BlockSpell) {
        world.level.map.setType(x, y, Type.Floor);
        screen.drawEntity(x, y);
      }
    }
  }
}

async function krozBonus(block: Type) {
  if (block === Type.K && world.level.bonus === 0) world.level.bonus = 1;
  if (block === Type.R && world.level.bonus === 1) world.level.bonus = 2;
  if (block === Type.O && world.level.bonus === 2) world.level.bonus = 3;
  if (block === Type.Z && world.level.bonus === 3) {
    await sound.bonusSound();
    world.addScore(block);
    await screen.flashTypeMessage(block);
  }
}

async function triggerOSpell(block: Type) {
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

async function triggerCSpell(block: Type) {
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

// TODO: Make this a component (isPushable)
async function pushRock(
  r: Entity,
  x: number,
  y: number,
  dx: number,
  dy: number,
) {
  let nogo = false;

  const p = world.level.player.get(Position)!;
  const tx = p.x + dx * 2;
  const ty = p.y + dy * 2;
  if (tx < 0 || tx > XMax || ty < 0 || ty > YMax) nogo = true;

  if (!nogo) {
    const t = world.level.map.get(tx, ty);
    if (!t) nogo = true;
    const tb = t!.type;

    async function moveRock(kill = false) {
      nogo = false;
      await sound.pushRock();
      if (kill) world.killAt(tx, ty);
      world.level.map.set(tx, ty, r);
      move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(Type.Rock, true);
    }

    // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST5.MOV#L1366
    if (ROCK_MOVEABLES.includes(tb as number)) {
      await moveRock();
    } else if (ROCK_CRUSHABLES.includes(tb as number)) {
      await moveRock();
      await sound.grab();
    } else if (MOBS.includes(tb as number)) {
      await moveRock(true);
      world.addScore(tb as Type);
      await sound.rockCrushMob();
    } else if (tb === Type.EWall) {
      await moveRock();
      world.level.map.setType(tx, ty, Type.Floor);
      sound.rockVaporized();
      await screen.flashMessage('The Boulder is vaporized!'); // TODO: show once?, change for pushed type
    } else if (ROCK_CLIFFABLES.includes(tb as number)) {
      nogo = false;
      await sound.pushRock();
      move(x, y);
      screen.drawType(tx, ty, r.type);
      await sound.rockDropped();
      screen.renderPlayfield();
      await screen.flashTypeMessage(Type.Rock, true);
    }
  }

  if (nogo) {
    await sound.blocked();
  }
}

// TODO: Make this a component
async function secretMessage() {
  await sound.secretMessage();

  await readMessage(dedent`
    You notice a secret message carved into the old tree...
    "Goodness of Heart Overcomes Adversity."
    Reveal that you found this message to Scott Miller...
    And receive a "MASTER KROZ CERTIFICATE" to hang on your wall!!
    Only the first 100 players to report this...
    Will be awarded the certificate.  Congratulations!
  `);
}

async function triggers(x: number, y: number, block: Type) {
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

async function wallVanish() {
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

async function trigger(type: Type, x: number, y: number) {
  switch (type) {
    case Type.SlowTime: // Triggers Slow Time
      world.level.T[Timer.SpeedTime] = 0; // Reset Speed Time
      world.level.T[Timer.FreezeTime] = 0;
      world.level.T[Timer.SlowTime] = SPELL_DURATION[Timer.SlowTime]; // Slow Time
      world.addScore(type);
      await screen.flashTypeMessage(type, true);
      break;
    case Type.SpeedTime: // Trigger Speed Time
      world.level.T[Timer.SlowTime] = 0; // Reset Slow Time
      world.level.T[Timer.SpeedTime] = SPELL_DURATION[Timer.SpeedTime]; // Speed Time
      world.addScore(type);
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Invisible: // Triggers Invisible spell
      world.level.T[Timer.Invisible] = SPELL_DURATION[Timer.Invisible];
      world.level.player.add(isInvisible);
      screen.drawEntity(x, y);
      world.addScore(type);
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Trap: // Triggers Teleport Trap
      world.addScore(type);
      await screen.flashTypeMessage(type, true);
      await teleport();
      break;
    case Type.Bomb: // Triggers Bomb
      await bomb(x, y);
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Freeze: // Trigger Freeze spell
      world.level.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Quake: // Triggers Quake
      await quakeTrap();
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Trap2: // Triggers Trap2
      replaceEntities(type, Type.Floor);
      break;
    case Type.Zap: // Triggers Zap
      await zapTrap();
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Create:
      // Triggers Create spell
      await createTrap();
      world.addScore(type);
      await screen.flashTypeMessage(type, true);
      break;
    case Type.ShowGems:
      // Triggers Show Gems spell
      sound.grab();
      await showGemsSpell();
      await screen.flashTypeMessage(type, false);
      break;
    case Type.BlockSpell:
      // Triggers Block spell
      await blockSpell();
      await screen.flashTypeMessage(type, true);
      break;
    case Type.WallVanish: // Trigger Wall Vanish
      await wallVanish();
      await screen.flashTypeMessage(type);
      break;
    case Type.K:
    case Type.R:
    case Type.O:
    case Type.Z:
      sound.grab();
      await krozBonus(type);
      break;
    case Type.OSpell1: // Triggers OSpell
    case Type.OSpell2:
    case Type.OSpell3:
      await triggerOSpell(type);
      await screen.flashTypeMessage(type, true);
      break;
    case Type.CSpell1: // Triggers CSpell
    case Type.CSpell2:
    case Type.CSpell3:
      await triggerCSpell(type);
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Trap3:
    case Type.Trap4:
    case Type.Trap5:
    case Type.Trap6:
    case Type.Trap7:
    case Type.Trap8:
    case Type.Trap9:
    case Type.Trap10:
    case Type.Trap11:
    case Type.Trap12:
    case Type.Trap13:
      replaceEntities(type, Type.Floor);
      break;
    case Type.TBlock: // Triggers
    case Type.TRock:
    case Type.TGem:
    case Type.TBlind:
    case Type.TWhip:
    case Type.TGold:
    case Type.TTree:
      // https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST1.LEV#L1236C1-L1254C23
      await triggers(x, y, type);
      break;
    case Type.ShootRight:
      await shoot(x, y, 1);
      break;
    case Type.ShootLeft:
      await shoot(x, y, -1);
      break;
  }
}

function move(x: number, y: number) {
  sound.footStep();

  const e = world.level.player;
  const p = e.get(Position)!;

  world.level.map.setType(p.x, p.y, p.replacement);
  screen.drawEntity(p.x, p.y);

  const b = world.level.map.getType(x, y) as Type;
  p.replacement = [Type.CWall1, Type.CWall2, Type.CWall3, Type.Rope].includes(b)
    ? b
    : Type.Floor;

  world.level.map.set(x, y, e);
  p.x = x;
  p.y = y;
  screen.drawEntity(p.x, p.y);
}

export async function specialTriggers(t: string) {
  // TODO: #CHANGE(INVISIBLE_SOLID_WALL,SOLID_WALL)
  // #GIVE(SCORE,25000)
  // #ITEMEFFECT(OPEN_SPELL1)
  // #SETLEVELFEATURE(WaterFlow,1)

  switch (t) {
    case 'HideGems':
      world.level.map.hideType(Type.Gem);
      break;
    case 'HideRocks':
      world.level.map.hideType(Type.Rock);
      break;
    case 'HideStairs':
      world.level.map.hideType(Type.Stairs);
      break;
    case 'HideOpenWall':
      // be careful with this one, name is confusing
      // hides the open wall spell, not the wall itself
      world.level.map.hideType(Type.OSpell1);
      world.level.map.hideType(Type.OSpell2);
      world.level.map.hideType(Type.OSpell3);
      break;
    case 'HideCreate':
      world.level.map.hideType(Type.Create);
      break;
    case 'HideMBlock':
      world.level.map.hideType(Type.MBlock);
      break;
    case 'HideTrap':
      world.level.map.hideType(Type.Trap);
      break;
    case 'HideLevel':
      for (let x = 0; x < world.level.map.width; x++) {
        for (let y = 0; y < world.level.map.height; y++) {
          const e = world.level.map.get(x, y)!;
          if (e && !e.has(isPlayer)) {
            e.add(isInvisible);
          }
        }
      }
      break;
    case 'ShowIWalls':
      for (let x = 0; x <= XMax; x++) {
        for (let y = 0; y <= YMax; y++) {
          if (world.level.map.getType(x, y) === Type.IWall) {
            await sound.play(x * y, 1, 10);
            world.level.map.setType(x, y, Type.OWall3);
            screen.drawEntity(x, y);
          }
        }
      }
      break;
    case 'RiverToGold':
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
    case 'RiverToBlock':
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
    case 'WallsToGold':
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
    case 'PitsToRock':
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
    case 'OSpell1':
      await triggerOSpell(Type.OSpell1);
      await screen.flashTypeMessage(Type.OSpell1, true);
      break;
    case 'DisguiseFast':
      world.level.map.updateTilesByType(Type.Fast, { ch: '☺' });
      screen.renderPlayfield();
      break;
    case 'FlashPlayer':
      flashPlayer();
      break;
  }
}
