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
    world.level.map.setType(
      world.level.player.x + 1,
      world.level.player.y,
      Type.Stairs,
    );
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
  const x = world.level.player.x + dx;
  const y = world.level.player.y + dy;

  if (x < 0 || x > XMax || y < 0 || y > YMax) {
    await sound.staticNoise();
    world.addScore(Type.Border);
    await screen.flashTypeMessage(Type.Border, true);
    return;
  }

  const block = world.level.map.getType(x, y) || Type.Floor;

  switch (block) {
    case Type.Floor: // moves
    case Type.Stop:
      move(x, y);
      break;
    case Type.Slow: // moves + Kills + Damage
    case Type.Medium:
    case Type.Fast:
      world.stats.gems -= block;
      world.killAt(x, y);
      world.addScore(block);
      move(x, y);
      break;
    case Type.Block: // blocked
    case Type.ZBlock:
    case Type.GBlock:
      world.addScore(block);
      await screen.flashTypeMessage(Type.Block, true);
      break;
    case Type.Whip: // collects
      sound.grab();
      world.stats.whips++;
      world.addScore(block);
      move(x, y);
      await screen.flashTypeMessage(Type.Whip, true);
      break;
    case Type.Stairs: // Next level
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
    case Type.Chest: {
      // Collects
      move(x, y);
      // TODO: Sound
      const whips = RNG.getUniformInt(2, 5);
      const gems = RNG.getUniformInt(2, world.game.difficulty + 2);
      world.stats.whips += whips;
      world.stats.gems += gems;
      world.addScore(block);
      await screen.flashMessage(
        `You found ${gems} gems and ${whips} whips inside the chest!`,
      );
      break;
    }
    case Type.SlowTime: // Triggers Slow Time
      world.level.T[Timer.SpeedTime] = 0; // Reset Speed Time
      world.level.T[Timer.FreezeTime] = 0;
      world.level.T[Timer.SlowTime] = SPELL_DURATION[Timer.SlowTime]; // Slow Time
      world.addScore(block);
      move(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Gem: // Collects gem
      sound.grab();
      world.stats.gems++;
      world.addScore(block);
      move(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Invisible: // Triggers Invisible spell
      world.level.T[Timer.Invisible] = SPELL_DURATION[Timer.Invisible];
      world.addScore(block);
      move(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Teleport: // Collects teleport
      world.stats.teleports++;
      world.addScore(block);
      move(x, y);
      screen.flashTypeMessage(block, true);
      break;
    case Type.Key: // Collects key
      sound.grab();
      world.stats.keys++;
      move(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Door: // Opens door (if has key)
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
    case Type.Wall: // Blocked
    case Type.River:
      sound.blockedWall();
      world.addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.SpeedTime: // Trigger Speed Time
      world.level.T[Timer.SlowTime] = 0; // Reset Slow Time
      world.level.T[Timer.SpeedTime] = SPELL_DURATION[Timer.SpeedTime]; // Speed Time
      world.addScore(block);
      move(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Trap: // Triggers Teleport Trap
      world.addScore(block);
      move(x, y);
      await screen.flashTypeMessage(block, true);
      await teleport();
      break;
    case Type.Power: // Collects poer ring
      world.stats.whipPower++;
      world.addScore(block);
      move(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Tree: // Blocked
    case Type.Forest:
      world.addScore(block);
      await sound.blocked();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Bomb: {
      // Triggers Bomb
      move(x, y);
      await bomb(x, y);
      await screen.flashTypeMessage(block, true);
      screen.renderBorder();
      break;
    }
    case Type.Lava: // Moves + Damage
      world.stats.gems -= 10;
      world.addScore(block);
      move(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Pit: // Moves + Kills
      move(x, y);
      world.stats.gems = -1; // dead
      await screen.flashTypeMessage(block);
      break;
    case Type.Tome:
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
      // Goes through tunnel
      // Player starting position
      const sx = world.level.player.x;
      const sy = world.level.player.y;

      move(x, y);
      await tunnel(x, y, sx, sy);
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.Freeze: // Trigger Freeze spell
      world.level.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
      move(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Nugget: // Collects nugget
      sound.grab();
      move(x, y);
      world.addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Quake: // Triggers Quake
      move(x, y);
      await quakeTrap();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.IBlock: // IBlock is replaced by Block
      sound.blockedWall();
      world.level.map.setType(x, y, Type.Block);
      screen.drawEntity(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.IWall: // IBlock is replaced by Wall
      sound.blockedWall();
      world.level.map.setType(x, y, Type.Wall);
      screen.drawEntity(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.IDoor: // IBlock is replaced by Door
      sound.blockedWall();
      world.level.map.setType(x, y, Type.Door);
      screen.drawEntity(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Trap2: // Triggers Trap2
      move(x, y);
      world.level.map.replaceEntities(Type.Trap2, Type.Floor);
      break;
    case Type.Zap: {
      // Triggers Zap spell
      move(x, y);
      await zapTrap();
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.Create: {
      // Triggers Create spell
      move(x, y);
      await createTrap();
      world.addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.Generator: // Blocked
      sound.blocked();
      world.addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.MBlock: // Blocked
      sound.blocked();
      world.addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.ShowGems: {
      // Triggers Show Gems spell
      move(x, y);
      sound.grab();
      await showGemsSpell();
      await screen.flashTypeMessage(block, false);
      break;
    }
    case Type.Tablet: // Reads tablet
      move(x, y);
      sound.grab();
      world.addScore(block);
      await screen.flashTypeMessage(block, true);
      await tabletMessage();
      break;
    case Type.BlockSpell: {
      // Triggers Block spell
      move(x, y);
      await blockSpell();
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.Chance: {
      // Collects pouch
      world.addScore(block);
      const g = RNG.getUniformInt(14, 18);
      world.stats.gems += g;
      move(x, y);
      await screen.flashMessage(`You found a Pouch containing ${g} Gems!`);
      break;
    }
    case Type.Statue: // Blocked
      sound.blocked();
      await screen.flashTypeMessage(block);
      break;
    case Type.WallVanish: // Trigger Wall Vanish
      move(x, y);
      await wallVanish();
      await screen.flashTypeMessage(block);
      break;
    case Type.K:
    case Type.R:
    case Type.O:
    case Type.Z:
      move(x, y);
      sound.grab();
      await krozBonus(block);
      break;
    case Type.OWall1: // Blocked
    case Type.OWall2:
    case Type.OWall3:
      sound.blockedWall();
      world.addScore(Type.Wall);
      await screen.flashTypeMessage(Type.OWall1, true);
      break;
    case Type.CWall1: // Moves
    case Type.CWall2:
    case Type.CWall3:
      move(x, y);
      break;
    case Type.OSpell1: // Triggers OSpell
    case Type.OSpell2:
    case Type.OSpell3: {
      move(x, y);
      await triggerOSpell(block);
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.CSpell1: // Triggers CSpell
    case Type.CSpell2:
    case Type.CSpell3: {
      move(x, y);
      await triggerCSpell(block);
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.Rock: {
      // Pushes rock
      await pushRock(x, y, dx, dy);
      break;
    }
    case Type.EWall: // Damage
      world.addScore(block);
      world.stats.gems--;
      sound.staticNoise();
      await screen.flashTypeMessage(Type.EWall, true);
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
      move(x, y);
      world.level.map.replaceEntities(block, Type.Floor);
      break;
    case Type.TBlock: // Triggers
    case Type.TRock:
    case Type.TGem:
    case Type.TBlind:
    case Type.TWhip:
    case Type.TGold:
    case Type.TTree:
      // https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST1.LEV#L1236C1-L1254C23
      move(x, y);
      await triggers(x, y, block);
      break;
    case Type.Rope: // Moves + Rope (Ropes not implemented)
      move(x, y);
      await screen.flashTypeMessage(Type.Rope, true);
      break;
    case Type.Message: {
      // Reads secret message
      await secretMessage();
      break;
    }
    case Type.ShootRight:
      move(x, y);
      await shoot(x, y, 1);
      break;
    case Type.ShootLeft:
      move(x, y);
      await shoot(x, y, -1);
      break;
    case Type.DropRope: // NOP
    case Type.DropRope2:
    case Type.DropRope3:
    case Type.DropRope4:
    case Type.DropRope5:
      move(x, y);
      break;
    case Type.Amulet:
      move(x, y);
      await gotAmulet();
      break;
    default:
      sound.blockedWall();
      break;
  }
}

async function whip() {
  const PX = world.level.player.x;
  const PY = world.level.player.y;

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

    const thing = world.level.map.getType(x, y);

    screen.drawOver(x, y, ch, ColorCodes[RNG.getUniformInt(0, 15) as Color]);

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
      case Type.Quake:
      case Type.IBlock:
      case Type.IWall:
      case Type.IDoor:
      case Type.Trap2:
      case Type.Trap3:
      case Type.Trap4:
      case Type.ShowGems:
      case Type.BlockSpell:
      case Type.Trap5:
      case Type.Trap6:
      case Type.Trap7:
      case Type.Trap8:
      case Type.Trap9:
      case Type.Trap10:
      case Type.Trap11:
      case Type.Trap12:
      case Type.Trap13:
      case Type.Stop:
        // No break, no effect
        break;
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
      case Type.Wall:
        break;
      default:
        break;
    }

    screen.renderStats();
    await delay(25);
  }
}

export async function flashPlayer() {
  for (let i = 0; i < 160; i++) {
    if (i % 5 === 0) {
      screen.drawType(
        world.level.player.x,
        world.level.player.y,
        Type.Player,
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 8),
      );
      await delay();
    }
    sound.play(i / 2, 80, 10);
  }
}

async function teleport() {
  await flashPlayer();

  world.level.map.setType(
    world.level.player.x,
    world.level.player.y,
    Type.Floor,
  );
  screen.drawEntity(world.level.player.x, world.level.player.y);

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

// See https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST5.MOV#L45
async function tabletMessage() {
  const tabletMessage = world.level.tabletMessage;
  if (tabletMessage) {
    if (typeof tabletMessage === 'string') {
      await screen.flashMessage(tabletMessage);
    } else if (typeof tabletMessage === 'function') {
      await tabletMessage();
    }
  }
}

export async function prayer() {
  await screen.flashMessage(
    'On the Ancient Tablet is a short Mantra, a prayer...',
  );
  await screen.flashMessage(
    'You take a deep breath and speak the words aloud...',
  );
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
  await screen.flashMessage(
    'You have found the Amulet of Yendor -- 25,000 points!',
  );
  await screen.flashMessage(
    'It seems that Kroz and Rogue share the same underground!)',
  );
  await screen.flashMessage(
    'Your quest for the treasure of Kroz must still continue...',
  );
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
    if (!e || e.x === -1 || e.y === -1) continue; // dead
    if (e.type !== Type.Slow && e.type !== Type.Medium && e.type !== Type.Fast)
      continue;
    await world.killAt(e.x, e.y);
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

async function pushRock(x: number, y: number, dx: number, dy: number) {
  let nogo = false;

  const rx = world.level.player.x + dx * 2;
  const ry = world.level.player.y + dy * 2;
  if (rx < 0 || rx > XMax || ry < 0 || ry > YMax) nogo = true;

  if (!nogo) {
    const rb = world.level.map.getType(rx, ry); // TODO: other cases

    async function moveRock() {
      nogo = false;
      await sound.pushRock();
      world.level.map.setType(rx, ry, Type.Rock);
      move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(Type.Rock, true);
    }

    // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST5.MOV#L1366
    if (ROCK_MOVEABLES.includes(rb as number)) {
      await moveRock();
    } else if (ROCK_CRUSHABLES.includes(rb as number)) {
      await moveRock();
      await sound.grab();
    } else if (MOBS.includes(rb as number)) {
      await moveRock();
      world.addScore(rb as Type);
      await sound.rockCrushMob();
    } else if (rb === Type.EWall) {
      await moveRock();
      world.level.map.setType(rx, ry, Type.Floor);
      sound.rockVaporized();
      await screen.flashMessage('The Boulder is vaporized!'); // TODO: show once
    } else if (ROCK_CLIFFABLES.includes(rb as number)) {
      nogo = false;
      await sound.pushRock();
      move(x, y);
      screen.drawType(rx, ry, Type.Rock);
      await sound.rockDropped();
      screen.renderPlayfield();
      await screen.flashTypeMessage(Type.Rock, true);
    }
  }

  if (nogo) {
    await sound.blocked();
  }
}

async function secretMessage() {
  await sound.secretMessage();
  await screen.flashMessage(
    'You notice a secret message carved into the old tree...',
  );
  await screen.flashMessage('"Goodness of Heart Overcomes Adversity."');
  await screen.flashMessage(
    'Reveal that you found this message to Scott Miller...',
  );
  await screen.flashMessage(
    'And receive a "MASTER KROZ CERTIFICATE" to hang on your wall!!',
  );
  await screen.flashMessage('Only the first 100 players to report this...');
  await screen.flashMessage(
    'Will be awarded the certificate.  Congratulations!',
  );
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

function move(x: number, y: number) {
  sound.footStep();

  const p = world.level.player;

  world.level.map.setType(p.x, p.y, p.replacement);
  screen.drawEntity(p.x, p.y);

  const b = world.level.map.getType(x, y) as Type;
  p.replacement = [Type.CWall1, Type.CWall2, Type.CWall3, Type.Rope].includes(b)
    ? b
    : Type.Floor;

  world.level.map.set(x, y, p);
  p.x = x;
  p.y = y;
  screen.drawEntity(p.x, p.y);
}
