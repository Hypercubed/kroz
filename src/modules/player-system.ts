import { RNG } from 'rot-js';

import * as controls from './controls.ts';
import * as display from './display.ts';
import * as sound from './sound.ts';
import * as screen from './screen.ts';
import * as world from './world.ts';
import * as levels from './levels.ts';
import * as effects from './effects.ts';
import * as bot from './bot.ts';

import {
  MOBS,
  ROCK_CLIFFABLES,
  ROCK_CRUSHABLES,
  ROCK_MOVEABLES,
  TUNNELABLES,
  Type,
} from '../data/tiles.ts';
import { DEBUG, XMax, XTop, YMax } from '../data/constants.ts';
import { Action } from './controls.ts';

import { Color } from '../data/colors.ts';
import { clamp, delay } from '../utils/utils.ts';
import { LEVELS } from './levels.ts';
import dedent from 'ts-dedent';

import {
  Attacks,
  Collectible,
  isInvisible,
  MagicTrigger,
  Position,
  isPushable,
  ReadMessage,
  ChangeLevel,
  isPassable,
} from '../classes/components.ts';
import { SPELL_DURATION, Timer } from './effects.ts';
import type { Entity } from '../classes/entity.ts';
import { Difficulty } from './world.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function update(_tick: number) {
  await _update();
  controls.clearActions(); // Clear was pressed actions after player acts
}

async function _update() {
  if (DEBUG && controls.wasActionDeactivated(Action.SlowerClock)) {
    world.game.clockScale = Math.min(20, world.game.clockScale + 1);
    console.log('Clock Scale:', world.game.clockScale);
    return;
  }

  if (DEBUG && controls.wasActionDeactivated(Action.FasterClock)) {
    world.game.clockScale = Math.max(1, world.game.clockScale - 1);
    console.log('Clock Scale:', world.game.clockScale);
    return;
  }

  // Game Actions
  if (controls.wasActionDeactivated(Action.Pause)) return pause();
  if (controls.wasActionDeactivated(Action.Quit)) return quit();
  if (controls.wasActionDeactivated(Action.Save)) return world.save();
  if (controls.wasActionDeactivated(Action.Restore)) return world.restore();

  // Debug Actions
  if (controls.wasActionDeactivated(Action.NextLevel))
    return await levels.nextLevel();
  if (controls.wasActionDeactivated(Action.PrevLevel))
    return await levels.prevLevel();

  if (
    world.game.difficulty === Difficulty.Cheat &&
    controls.wasActionDeactivated(Action.NextLevelCheat)
  ) {
    const p = world.level.player.get(Position)!;
    world.level.map.setType(p.x + 1, p.y, Type.Stairs);
    await sound.cheat();
    return;
  }

  if (
    world.game.difficulty === Difficulty.Cheat &&
    controls.wasActionDeactivated(Action.FreeItems)
  ) {
    world.stats.gems = 150;
    world.stats.whips = 99;
    world.stats.teleports = 99;
    world.stats.keys = 9;
    screen.renderStats();
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

  // Whip can happen at any time (no return)
  if (controls.wasActionActive(Action.Whip)) {
    if (world.stats.whips < 1) {
      sound.noneSound();
    } else {
      world.stats.whips--;
      await effects.whip();
    }
  }

  if (controls.wasActionActive(Action.Teleport)) {
    if (world.stats.teleports < 1) {
      await sound.noneSound();
    } else {
      world.stats.teleports--;
      move(...(await effects.teleport()));
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

  if (world.game.bot && !world.game.paused && !world.game.done) {
    await bot.botPlay();
    return;
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

  const block = world.level.map.getType(x, y);

  if (e.has(isPassable)) {
    move(x, y);
  }

  if (e.has(Attacks)) {
    const damage = e.get(Attacks)!.damage;
    world.stats.gems -= damage;
    world.killAt(x, y);
    world.addScore(e.type as Type);
    move(x, y);
  }

  if (e.has(Collectible)) {
    sound.grab(); // TODO: Chest sound
    const collect = e.get(Collectible)!;

    world.stats.whips += collect.whips;
    world.stats.gems += collect.gems;
    world.stats.teleports += collect.teleports;
    world.stats.keys += collect.keys;
    world.stats.whipPower += collect.whipPower;

    world.addScore(block as Type);

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
  }

  if (e.has(MagicTrigger)) {
    await trigger(e.get(MagicTrigger)!.type, x, y);
  }

  if (e.has(isPushable)) {
    await pushRock(e, x, y, dx, dy);
    return;
  }

  if (e.has(ReadMessage)) {
    sound.grab();
    world.addScore(block as Type);
    await screen.flashTypeMessage(block as Type, true);
    await effects.readMessage(e.get(ReadMessage)?.message);
  }

  if (e.has(ChangeLevel)) {
    const c = e.get(ChangeLevel)!;
    if (c.deltaLevel > 0) {
      if (world.stats.levelIndex === LEVELS.length - 1) {
        await endRoutine();
        return;
      }
      world.addScore(block as Type);
      await screen.flashTypeMessage(Type.Stairs, true);
      sound.footStep();
      await levels.nextLevel(c.deltaLevel);
    } else if (c.deltaLevel < 0) {
      sound.footStep();
      await levels.prevLevel(-c.deltaLevel);
    } else if (c.exactLevel !== null) {
      sound.footStep();
      world.stats.levelIndex = c.exactLevel - 1;
      await levels.nextLevel(1);
    }
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
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Pit: // Moves + Kills -> Kills Component?
      world.stats.gems = -1; // dead
      await screen.flashTypeMessage(block);
      break;
    case Type.Tome:
      // TODO: Make a ReadMessage effect
      effects.replaceEntities(Type.Tome, Type.Stairs);
      screen.drawType(x, y);
      break;
    case Type.Tunnel: {
      // -> isTunnel Component?
      // Goes through tunnel

      const p = world.level.player.get(Position)!;
      await tunnel(x, y, p.px!, p.py!);

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
    default:
      // TODO: Only if nothing else happened
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isNaN(block as any) || typeof block === 'string') {
        sound.blockedWall();
      }
      break;
  }
}

export async function dead() {
  await effects.flashPlayer();
  const p = world.level.player.get(Position)!;
  screen.drawOver(p.x, p.y, '*', Color.White);
  display.drawText(
    XTop / 2 - 7,
    0,
    ' YOU HAVE DIED!! ',
    Color.Black | 16,
    Color.Red,
  );
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
  world.game.paused = true;
  screen.fullRender();
  await screen.flashMessage('Press any key to resume');
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
    case Type.Trap: {
      // Triggers Teleport Trap
      world.addScore(type);
      await screen.flashTypeMessage(type, true);
      move(...(await effects.teleport()));
      break;
    }
    case Type.Bomb: // Triggers Bomb
      await effects.bomb(x, y);
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Freeze: // Trigger Freeze spell
      world.level.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Quake: // Triggers Quake
      await effects.quakeTrap();
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Trap2: // Triggers Trap2
      effects.replaceEntities(type, Type.Floor);
      break;
    case Type.Zap: // Triggers Zap
      await effects.zapTrap();
      await screen.flashTypeMessage(type, true);
      break;
    case Type.Create:
      // Triggers Create spell
      await effects.createTrap();
      world.addScore(type);
      await screen.flashTypeMessage(type, true);
      break;
    case Type.ShowGems:
      // Triggers Show Gems spell
      sound.grab();
      await effects.showGemsSpell();
      await screen.flashTypeMessage(type, false);
      break;
    case Type.BlockSpell:
      // Triggers Block spell
      await effects.blockSpell();
      await screen.flashTypeMessage(type, true);
      break;
    case Type.WallVanish: // Trigger Wall Vanish
      await effects.wallVanish();
      await screen.flashTypeMessage(type);
      break;
    case Type.K:
    case Type.R:
    case Type.O:
    case Type.Z:
      sound.grab();
      await effects.krozBonus(type);
      break;
    case Type.OSpell1: // Triggers OSpell
    case Type.OSpell2:
    case Type.OSpell3:
      await effects.triggerOSpell(type);
      await screen.flashTypeMessage(type, true);
      break;
    case Type.CSpell1: // Triggers CSpell
    case Type.CSpell2:
    case Type.CSpell3:
      await effects.triggerCSpell(type);
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
      effects.replaceEntities(type, Type.Floor);
      break;
    case Type.TBlock: // Triggers
    case Type.TRock:
    case Type.TGem:
    case Type.TBlind:
    case Type.TWhip:
    case Type.TGold:
    case Type.TTree:
      // https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST1.LEV#L1236C1-L1254C23
      await effects.triggers(x, y, type);
      break;
    case Type.ShootRight:
      await effects.shoot(x, y, 1);
      break;
    case Type.ShootLeft:
      await effects.shoot(x, y, -1);
      break;
  }
}

export function move(x: number, y: number) {
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

export async function tunnel(x: number, y: number, sx: number, sy: number) {
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

export async function pushRock(
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
