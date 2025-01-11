import { RNG } from 'rot-js';

import * as controls from './controls';
import * as display from './display';
import * as sound from './sound';
import * as screen from './screen';
import * as state from './state';
import * as levels from './levels';

import {
  Type,
  BOMBABLES,
  ROCKABLES,
  VISUAL_TELEPORTABLES,
  MOBS,
  TBLOCKS,
  ITRAPS,
  COLLECTABLES,
  CWALLS,
  CSPELLS,
  KROZ,
  OSPELLS,
  ROPE_DROP,
  OWALLS,
  TypeChar,
  TypeColor,
} from '../data/tiles.ts';
import {
  HEIGHT,
  TIME_SCALE,
  TITLE,
  WIDTH,
  XBot,
  XSize,
  XTop,
  YBot,
  YSize,
  YTop,
} from '../data/constants.ts';
import { Actor, ActorType } from '../classes/actors.ts';
import { Action } from './controls';

import { Color, ColorCodes } from '../data/colors.ts';
import { clamp, delay } from '../utils/utils.ts';
import { LEVELS } from './levels';
import dedent from 'ts-dedent';
import { Timer } from './state';

const SPELL_DURATION = {
  [Timer.SlowTime]: 70 * TIME_SCALE,
  [Timer.Invisible]: 75 * TIME_SCALE,
  [Timer.SpeedTime]: 80 * TIME_SCALE,
  [Timer.FreezeTime]: 55 * TIME_SCALE,
};

export async function effects() {
  // Effect timers
  for (let i = 0; i < state.level.T.length; i++) {
    state.level.T[i] = Math.max(0, state.level.T[i] - 1);
  }

  // Statue Gem Drain
  if (
    state.level.T[Timer.StatueGemDrain] > 0 &&
    RNG.getUniformInt(0, 18) === 0
  ) {
    state.stats.gems--;
    await sound.play(3800, 40);
    screen.renderStats();
  }

  // Creature generation
  const sNum = state.level.entities.reduce((acc, e) => {
    if (e.type === Type.Slow) return acc + 1;
    return acc;
  }, 0);

  if (
    state.level.genNum > 0 &&
    sNum < 995 &&
    RNG.getUniformInt(0, 17) === 0 // 1 in 17 chance of generating a creature
  ) {
    await generateCreatures();
  }

  // Magic EWalls
  if (state.level.magicEwalls && RNG.getUniformInt(0, 7) === 0) {
    for (let i = 0; i < 100; i++) {
      const x = RNG.getUniformInt(0, XSize);
      const y = RNG.getUniformInt(0, YSize);
      const block = state.level.map.getType(x, y);
      if (block === Type.CWall1) {
        state.level.map.setType(x, y, Type.EWall);
        screen.drawEntity(x, y);
        break;
      }
    }
    for (let i = 0; i < 100; i++) {
      const x = RNG.getUniformInt(0, XSize);
      const y = RNG.getUniformInt(0, YSize);
      const block = state.level.map.getType(x, y);
      if (block === Type.EWall) {
        state.level.map.setType(x, y, Type.CWall1);
        screen.drawEntity(x, y);
        break;
      }
    }
  }

  // Evaporate
  if (state.level.evapoRate > 0 && RNG.getUniformInt(0, 9) === 0) {
    const x = RNG.getUniformInt(0, XSize);
    const y = RNG.getUniformInt(0, YSize);
    const block = state.level.map.getType(x, y);
    if (block === Type.River) {
      state.level.map.setType(x, y, Type.Floor);
      screen.drawEntity(x, y);
      // TODO: Sound
    }
  }

  // TODO:
  // Lava Flow
  // TreeGrow
}

async function mobAction(e: Actor) {
  if (
    e.x === -1 ||
    e.y === -1 ||
    state.level.map.getType(e.x, e.y) !== (e.type as unknown as Type) // Killed
  ) {
    e.kill();
    return;
  } // dead

  let dx = 0;
  let dy = 0;
  if (state.level.player.x < e.x) dx = -1;
  if (state.level.player.x > e.x) dx = 1;
  if (state.level.player.y < e.y) dy = -1;
  if (state.level.player.y > e.y) dy = 1;

  const x = e.x + dx;
  const y = e.y + dy;

  if (x < 0 || x >= XSize || y < 0 || y >= YSize) return;

  const block = state.level.map.getType(x, y);

  switch (block) {
    case Type.Floor: // Breaks
    case Type.TBlock:
    case Type.TRock:
    case Type.TGem:
    case Type.TBlind:
    case Type.TGold:
    case Type.TWhip:
    case Type.TTree:
      e.move(x, y);
      break;
    case Type.Block: // Breaks + Kills
    case Type.MBlock:
    case Type.ZBlock:
    case Type.GBlock:
      state.level.map.setType(e.x, e.y, Type.Floor);
      state.level.map.setType(x, y, Type.Floor);
      e.kill();
      addScore(block);
      sound.play(800, 18);
      sound.play(400, 20);
      break;
    case Type.Player: // Damage + Kills
      state.stats.gems--;
      state.level.map.setType(e.x, e.y, Type.Floor);
      e.kill();
      addScore(block);
      break;
    case Type.Whip: // Grabs
    case Type.Chest:
    case Type.SlowTime:
    case Type.Gem:
    case Type.Invisible:
    case Type.Teleport:
    case Type.Key:
    case Type.SpeedTime:
    case Type.Trap:
    case Type.Power:
    case Type.Freeze:
    case Type.Nugget:
    case Type.K:
    case Type.R:
    case Type.O:
    case Type.Z:
    case Type.ShootRight:
    case Type.ShootLeft:
      sound.grab();
      e.move(x, y);
      break;
    default: // Blocked
      e.move(e.x, e.y);
      break;
  }
}

async function mBlockAction(e: Actor) {
  if (
    e.x === -1 ||
    e.y === -1 ||
    state.level.map.getType(e.x, e.y) !== (e.type as unknown as Type) // Killed
  ) {
    e.kill();
    return;
  } // dead

  let dx = 0;
  let dy = 0;
  if (state.level.player.x < e.x) dx = -1;
  if (state.level.player.x > e.x) dx = 1;
  if (state.level.player.y < e.y) dy = -1;
  if (state.level.player.y > e.y) dy = 1;

  const x = e.x + dx;
  const y = e.y + dy;

  if (x < 0 || x >= XSize || y < 0 || y >= YSize) return;

  const block = state.level.map.getType(x, y);

  switch (block) {
    case Type.Floor: // Moves
      e.move(x, y);
      e.ch = TypeChar[Type.Block]; // MBlocks become visible afer moving
      e.fg = TypeColor[Type.Block][0] ?? TypeColor[Type.Floor][0];
      e.bg = TypeColor[Type.Block][1] ?? TypeColor[Type.Floor][1];
      break;
    default: // Blocked
      e.move(e.x, e.y);
      break;
  }
}

export async function entitiesAction(t?: ActorType) {
  if (t === Type.Player) {
    // await playerAction(); // Player acts every tick
    return;
  }

  if (state.level.T[Timer.FreezeTime] > 0) return;

  for (let i = 0; i < state.level.entities.length; i++) {
    const e = state.level.entities[i];
    if (t && e.type !== t) continue;

    if (e.x === -1 || e.y === -1) continue; // dead

    if (e.type === Type.MBlock) {
      await mBlockAction(e);
    } else {
      await mobAction(e);
    }
  }
  screen.renderPlayfield();
}

export async function playerAction() {
  // Debug Actions
  if (controls.wasActionDeactivated(Action.NextLevel))
    return await levels.nextLevel();
  if (controls.wasActionDeactivated(Action.PrevLevel))
    return await levels.prevLevel();

  if (controls.wasActionDeactivated(Action.NextLevelCheat)) {
    state.level.map.setType(
      state.level.player.x + 1,
      state.level.player.y,
      Type.Stairs,
    );
    await sound.play(2000, 40, 10);
    return;
  }

  if (controls.wasActionDeactivated(Action.FreeItems)) {
    state.stats.gems = 150;
    state.stats.whips = 99;
    state.stats.teleports = 99;
    state.stats.keys = 9;
    screen.renderStats();
    return;
  }

  if (controls.wasActionDeactivated(Action.SlowerClock)) {
    state.game.clockScale = Math.min(20, state.game.clockScale + 1);
    console.log('Clock Scale:', state.game.clockScale);
    return;
  }

  if (controls.wasActionDeactivated(Action.FasterClock)) {
    state.game.clockScale = Math.max(1, state.game.clockScale - 1);
    console.log('Clock Scale:', state.game.clockScale);
    return;
  }

  // Player Actions
  if (controls.wasActionDeactivated(Action.ResetFound)) {
    state.game.foundSet = new Set();
    await screen.flashMessage('Newly found object descriptions are reset.');
    return;
  }
  if (controls.wasActionDeactivated(Action.HideFound)) {
    state.game.foundSet = true;
    await screen.flashMessage(
      'References to new objects will not be displayed.',
    );
    return;
  }

  // Game Actions
  if (controls.wasActionDeactivated(Action.Pause)) return pause();
  if (controls.wasActionDeactivated(Action.Quit)) return quit();
  if (controls.wasActionDeactivated(Action.Save)) return state.save();
  if (controls.wasActionDeactivated(Action.Restore)) return state.restore();

  // Whip can happen at any time (no return)
  if (controls.wasActionActive(Action.Whip)) {
    if (state.stats.whips < 1) {
      sound.noneSound();
    } else {
      state.stats.whips--;
      await playerWhip();
    }
  }

  if (controls.wasActionActive(Action.Teleport)) {
    if (state.stats.teleports < 1) {
      await sound.noneSound();
    } else {
      state.stats.teleports--;
      await playerTeleport();
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
    await tryPlayerMove(dx, dy);
  }
}

export async function tryPlayerMove(dx: number, dy: number) {
  const x = state.level.player.x + dx;
  const y = state.level.player.y + dy;

  if (x < 0 || x > XSize || y < 0 || y > YSize) {
    await sound.staticNoise();
    addScore(Type.Border);
    await screen.flashTypeMessage(Type.Border, true);
    return;
  }

  const block = state.level.map.getType(x, y) || Type.Floor;

  switch (block) {
    case Type.Floor:
    case Type.Stop:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      break;
    case Type.Slow:
    case Type.Medium:
    case Type.Fast:
      state.stats.gems -= block;
      killAt(x, y);
      addScore(block);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      break;
    case Type.Block:
    case Type.ZBlock:
    case Type.GBlock:
      addScore(block);
      await screen.flashTypeMessage(Type.Block, true);
      break;
    case Type.Whip:
      sound.grab();
      state.stats.whips++;
      addScore(block);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(Type.Whip, true);
      break;
    case Type.Stairs:
      if (state.stats.levelIndex === LEVELS.length - 1) {
        state.level.player.move(x, y);
        screen.renderPlayfield();
        await endRoutine();
        return;
      }
      state.level.player.move(x, y);
      screen.renderPlayfield();
      addScore(block);
      await screen.flashTypeMessage(Type.Stairs, true);
      sound.footStep();
      await levels.nextLevel();
      break;
    case Type.Chest: {
      state.level.player.move(x, y);
      screen.renderPlayfield();
      // TODO: Sound
      const whips = RNG.getUniformInt(2, 5);
      const gems = RNG.getUniformInt(2, state.game.difficulty + 2);
      state.stats.whips += whips;
      state.stats.gems += gems;
      addScore(block);
      await screen.flashMessage(
        `You found ${gems} gems and ${whips} whips inside the chest!`,
      );
      break;
    }
    case Type.SlowTime:
      state.level.T[Timer.SpeedTime] = 0; // Reset Speed Time
      state.level.T[Timer.FreezeTime] = 0;
      state.level.T[Timer.SlowTime] = SPELL_DURATION[Timer.SlowTime]; // Slow Time
      addScore(block);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Gem:
      sound.grab();
      state.stats.gems++;
      addScore(block);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Invisible:
      state.level.T[Timer.Invisible] = SPELL_DURATION[Timer.Invisible];
      addScore(block);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Teleport:
      state.stats.teleports++;
      addScore(block);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      screen.flashTypeMessage(block, true);
      break;
    case Type.Key:
      sound.grab();
      state.stats.keys++;
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Door:
      if (state.stats.keys < 1) {
        sound.play(Math.random() * 129 + 30, 150, 100);
        await delay(100);
        await screen.flashTypeMessage(block);
      } else {
        state.stats.keys--;
        addScore(block);
        await sound.openDoor();
        state.level.player.move(x, y);
        screen.renderPlayfield();
        await screen.flashMessage(
          'The Door opens!  (One of your Keys is used.)',
        );
      }
      break;
    case Type.Wall:
      sound.blockedWall();
      addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.River:
      addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.SpeedTime:
      state.level.T[Timer.SlowTime] = 0; // Reset Slow Time
      state.level.T[Timer.SpeedTime] = SPELL_DURATION[Timer.SpeedTime]; // Speed Time
      addScore(block);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Trap:
      addScore(block);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(block, true);
      await playerTeleport();
      break;
    case Type.Power:
      state.stats.whipPower++;
      addScore(block);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Tree:
    case Type.Forest:
      addScore(block);
      await sound.blocked();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Bomb: {
      state.level.player.move(x, y);
      screen.renderPlayfield();
      playerBomb(x, y);
      await screen.flashTypeMessage(block, true);
      screen.renderBorder();
      break;
    }
    case Type.Lava:
      state.stats.gems -= 10;
      addScore(block);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Pit:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      state.stats.gems = -1; // dead
      await screen.flashTypeMessage(block);
      break;
    case Type.Tome:
      // Tome_Message;
      // Tome_Effects

      state.level.map.setType(31, 6, Type.Stairs);
      screen.drawType(31, 6, Type.Stairs);

      addScore(block);
      await screen.flashTypeMessage(block);
      await screen.flashMessage(
        'Congratulations, Adventurer, you finally did it!!!',
      );
      break;
    case Type.Nugget:
      sound.grab();
      state.level.player.move(x, y);
      screen.renderPlayfield();
      addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Freeze:
      state.level.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Tunnel: {
      // Player starting position
      const sx = state.level.player.x;
      const sy = state.level.player.y;

      state.level.player.move(x, y);
      screen.renderPlayfield();
      await playerTunnel(x, y, sx, sy);
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.Quake:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await quakeTrap();
      await screen.flashTypeMessage(block, true);
      break;
    case Type.IWall:
      sound.blockedWall();
      state.level.map.setType(x, y, Type.Wall);
      screen.drawEntity(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.IBlock:
      sound.blockedWall();
      state.level.map.setType(x, y, Type.Block);
      screen.drawEntity(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.IDoor:
      sound.blockedWall();
      state.level.map.setType(x, y, Type.Door);
      screen.drawEntity(x, y);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.Zap: {
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await zapTrap();
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.Create: {
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await createTrap();
      addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.Generator:
      addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.MBlock:
      addScore(block);
      await screen.flashTypeMessage(block, true);
      break;
    case Type.ShowGems: {
      state.level.player.move(x, y);
      screen.renderPlayfield();
      sound.grab();
      await showGemsSpell();
      await screen.flashTypeMessage(block, false);
      break;
    }
    case Type.Tablet:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      sound.grab();
      addScore(block);
      await screen.flashTypeMessage(block, true);
      await tabletMessage();
      break;
    case Type.BlockSpell: {
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await blockSpell();
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.Chance: {
      addScore(block);
      const g = RNG.getUniformInt(14, 18);
      state.stats.gems += g;
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashMessage(`You found a Pouch containing ${g} Gems!`);
      break;
    }
    case Type.Statue:
      sound.blocked();
      await screen.flashTypeMessage(block);
      break;
    case Type.WallVanish:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(block);
      break;
    case Type.K:
    case Type.R:
    case Type.O:
    case Type.Z:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      sound.grab();
      await krozBonus(block);
      break;
    case Type.OWall1:
    case Type.OWall2:
    case Type.OWall3:
      sound.blockedWall();
      await screen.flashTypeMessage(Type.OWall1, true);
      break;
    case Type.OSpell1:
    case Type.OSpell2:
    case Type.OSpell3: {
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await oSpell(block);
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.CSpell1:
    case Type.CSpell2:
    case Type.CSpell3: {
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await cSpell(block);
      await screen.flashTypeMessage(block, true);
      break;
    }
    case Type.Rock: {
      await pushRock(x, y, dx, dy);
      break;
    }
    case Type.EWall:
      addScore(block);
      state.stats.gems--;
      sound.staticNoise();
      await screen.flashTypeMessage(Type.EWall, true);
      break;
    case Type.CWall1:
    case Type.CWall2:
    case Type.CWall3:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      break;
    case Type.Trap2:
    case Type.Trap4:
      // TBD
      state.level.player.move(x, y);
      screen.renderPlayfield();
      break;
    case Type.Trap3:
    case Type.Trap5:
    case Type.Trap6:
    case Type.Trap7:
    case Type.Trap8:
    case Type.Trap9:
    case Type.Trap10:
    case Type.Trap11:
    case Type.Trap12:
    case Type.Trap13: {
      state.level.player.move(x, y);
      screen.renderPlayfield();
      aTrap(block);
      break;
    }
    case Type.TBlock: // 68..74 Triggers
    case Type.TRock:
    case Type.TGem:
    case Type.TBlind:
    case Type.TWhip:
    case Type.TGold:
    case Type.TTree:
      // https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST1.LEV#L1236C1-L1254C23
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await triggers(x, y, block);
      break;
    case Type.Rope:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await screen.flashTypeMessage(Type.Rope, true);
      break;
    case Type.Message: {
      await messageInTheTree();
      break;
    }
    case Type.ShootRight:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await shoot(x, y, 1);
      break;
    case Type.ShootLeft:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await shoot(x, y, -1);
      break;
    case Type.DropRope:
    case Type.DropRope2:
    case Type.DropRope3:
    case Type.DropRope4:
    case Type.DropRope5:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      break;
    case Type.Amulet:
      state.level.player.move(x, y);
      screen.renderPlayfield();
      await gotAmulet();
      break;
    default:
      sound.blockedWall();
      break;
  }
}

async function killAt(x: number, y: number) {
  const block = state.level.map.getType(x, y);

  state.level.map.setType(x, y, Type.Floor);

  if (block === Type.Slow || block === Type.Medium || block === Type.Fast) {
    for (let i = 0; i < state.level.entities.length; i++) {
      const m = state.level.entities[i];
      if (m.x === x && m.y === y) {
        await m.kill();
      }
    }
  }
}

async function generateCreatures() {
  let done = false;
  do {
    const x = RNG.getUniformInt(0, XSize);
    const y = RNG.getUniformInt(0, YSize);
    if (state.level.map.getType(x, y) === Type.Floor) {
      state.level.entities.push(new Actor(Type.Slow, x, y));
      state.level.map.setType(x, y, Type.Slow);

      for (let i = 5; i < 70; i++) {
        sound.play(i * 8, 1);
      }
      await delay(50);

      done = true;
    }

    screen.renderPlayfield();
  } while (!done && RNG.getUniformInt(0, 50) !== 0);
}

async function playerWhip() {
  const PX = state.level.player.x;
  const PY = state.level.player.y;

  sound.play(70, 50 * 8, 100);
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
    if (x < 0 || x >= XSize || y < 0 || y >= YSize) return;

    const thing = state.level.map.getType(x, y);

    screen.drawOver(x, y, ch, ColorCodes[RNG.getUniformInt(0, 15) as Color]);

    switch (thing) {
      case Type.Slow: // Kill
      case Type.Medium:
      case Type.Fast:
        killAt(x, y);
        screen.renderPlayfield();
        addScore(thing);
        break;
      case Type.Block:
      case Type.Forest:
      case Type.Tree:
      case Type.Message:
      case Type.MBlock:
      case Type.ZBlock:
      case Type.GBlock: {
        // Destroy?
        const w = state.stats.whipPower;
        if (6 * Math.random() < w) {
          if (thing === Type.MBlock) killAt(x, y);
          state.level.map.setType(x, y, Type.Floor);
          screen.drawEntity(x, y);
          screen.drawOver(
            x,
            y,
            ch,
            ColorCodes[RNG.getUniformInt(0, 15) as Color],
          );
          for (let i = 330; i > 20; i--) {
            // TODO: This sound sucks
            // sound.play(RNG.getUniformInt(0, i), 10);
            sound.play(90, 10, 0.5);
          }
        } else {
          sound.play(130, 25);
          sound.play(90, 50);
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
        state.level.map.setType(x, y, Type.Floor);
        sound.play(400, 50);
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
        if (30 * Math.random() < state.stats.whipPower) {
          sound.play(130, 50);
          state.level.map.setType(x, y, Type.Floor);
        } else {
          sound.play(130, 25);
          sound.play(90, 50);
        }
        break;
      case Type.Statue:
        // TODO: Sound
        if (50 * Math.random() < state.stats.whipPower) {
          // TODO: Sound
          state.level.map.setType(x, y, Type.Floor);
          addScore(thing);
          state.level.T[Timer.StatueGemDrain] = -1;
          await screen.flashMessage(
            `You've destroyed the Statue!  Your Gems are now safe.`,
          );
        } else {
          sound.play(130, 25);
          sound.play(90, 50);
        }
        break;
      case Type.Generator:
        // TODO: Sound
        addScore(thing);
        state.level.map.setType(x, y, Type.Floor);
        state.level.genNum--;
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
        state.level.player.x,
        state.level.player.y,
        Type.Player,
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 8),
      );
      await delay();
    }
    sound.play(i / 2, 80, 10);
  }
}

async function playerTeleport() {
  await flashPlayer();

  state.level.map.setType(
    state.level.player.x,
    state.level.player.y,
    Type.Floor,
  );
  screen.drawEntity(state.level.player.x, state.level.player.y);

  // Animation
  const startTime = Date.now();
  for (let i = 0; i < 700; i++) {
    const x = RNG.getUniformInt(0, XSize);
    const y = RNG.getUniformInt(0, YSize);
    const block = state.level.map.getType(x, y);
    if (VISUAL_TELEPORTABLES.indexOf(block as Type) > -1) {
      screen.drawType(
        x,
        y,
        '☺',
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 7),
      );
      await sound.play(20, 10, 100);
      screen.drawType(x, y, block);
    }
    if (Date.now() - startTime > 1500) break;
  }

  // Teleport
  state.level.player.move(...state.level.map.findRandomEmptySpace());
}

function addScore(block: Type) {
  switch (block) {
    case Type.Border:
      if (state.stats.score > state.stats.levelIndex)
        state.stats.score -= state.stats.levelIndex / 2;
      break;
    case Type.Slow:
    case Type.Medium:
    case Type.Fast:
      state.stats.score += block;
      break;
    case Type.Block:
    case Type.ZBlock:
    case Type.GBlock:
    case Type.Wall:
    case Type.River:
    case Type.Tree:
    case Type.Forest:
    case Type.MBlock:
    case Type.OWall1:
    case Type.OWall2:
    case Type.OWall3:
    case Type.EWall:
      if (state.stats.score > 2) state.stats.score -= 2;
      break;
    case Type.Whip:
    case Type.SlowTime:
    case Type.Bomb:
      state.stats.score++;
      break;
    case Type.Stairs:
      state.stats.score += state.stats.levelIndex * 5;
      break;
    case Type.Chest:
      state.stats.score += 10 + Math.floor(state.stats.levelIndex / 2);
      break;
    case Type.Gem:
      state.stats.score += Math.floor(state.stats.levelIndex / 2) + 1;
      break;
    case Type.Invisible:
      state.stats.score += 25;
      break;
    case Type.Nugget:
      state.stats.score += 50;
      break;
    case Type.Door:
      state.stats.score += 10;
      break;
    case Type.Teleport:
    case Type.Freeze:
      state.stats.score += 2;
      break;
    case Type.SpeedTime:
    case Type.Power:
      state.stats.score += 5;
      break;
    case Type.Trap:
      if (state.stats.score > 5) state.stats.score -= 5;
      break;
    case Type.Lava:
      if (state.stats.score > 100) state.stats.score += 100;
      break;
    case Type.Tome:
      state.stats.score += 5000;
      break;
    case Type.Tablet:
      state.stats.score += state.stats.levelIndex + 250;
      break;
    case Type.Chance:
      state.stats.score += 100;
      break;
    case Type.Statue:
      state.stats.score += 10;
      break;
    case Type.Amulet:
      state.stats.score += 2500;
      break;
    case Type.Z:
      state.stats.score += 1000;
      break;
    // case Type.Border:
    //   if (state.stats.score > state.level.level) state.stats.score -= Math.floor(state.stats.levelIndex/ 2);
    //   break;
  }

  screen.renderStats();
}

export async function dead() {
  display.drawText(XTop / 2 - 7, 0, 'You have died.', Color.Black, Color.Red);
  await screen.flashMessage('Press any key to continue.');
  state.game.done = true;
}

async function quit() {
  let answer = '';

  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n') {
    answer = await screen.flashMessage('Are you sure you want to quit? (Y/N)');
  }

  if (answer.toLowerCase() === 'y') {
    state.game.done = true;
  }
}

async function pause() {
  await screen.flashMessage('Press any key to resume');
}

// See https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST5.MOV#L45
async function tabletMessage() {
  const level = state.level.level!;
  if (level.tabletMessage) {
    if (typeof level.tabletMessage === 'string') {
      await screen.flashMessage(level.tabletMessage);
    } else if (typeof level.tabletMessage === 'function') {
      await level.tabletMessage();
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

export async function renderTitle() {
  display.clear(Color.Blue);

  display.drawText(
    2,
    5,
    dedent`
    In the mystical Kingdom of Kroz, where ASCII characters come to life and
    danger lurks around every corner, a new chapter unfolds. You, a brave
    archaeologist, have heard whispers of the legendary Magical Amulet of Kroz,
    an artifact of immense power long thought lost to time.

    Will you be the one to uncover the secrets of the forsaken caverns? Can you
    retrieve the Magical Amulet and restore glory to the Kingdom of Kroz? The
    adventure awaits, brave explorer!

  `,
    Color.LightCyan,
    Color.Blue,
  );

  display.drawText(
    9,
    16,
    `Use the cursor keys to move yourself (%c{${ColorCodes[Color.Yellow]}}☻%c{${ColorCodes[Color.LightGreen]}}) through the caverns.`,
    Color.LightGreen,
    Color.Blue,
  );

  display.writeCenter(
    17,
    `Use your whip (press W) to destroy all nearby creatures.`,
    Color.LightGreen,
    Color.Blue,
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to begin your decent into Kroz.',
    Color.HighIntensityWhite,
    Color.Blue,
  );

  const x = WIDTH / 2 - TITLE.length / 2;

  await controls.repeatUntilKeyPressed(async () => {
    display.drawText(x, 3, TITLE, RNG.getUniformInt(0, 16), Color.Red);
    await delay(500);
  });
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
  const gems = (state.stats.gems = isFinite(state.stats.gems)
    ? state.stats.gems
    : 150);
  const whips = (state.stats.whips = isFinite(state.stats.whips)
    ? state.stats.whips
    : 20);
  const teleports = (state.stats.teleports = isFinite(state.stats.teleports)
    ? state.stats.teleports
    : 10);
  const keys = (state.stats.keys = isFinite(state.stats.keys)
    ? state.stats.keys
    : 5);

  await screen.flashMessage('Your Gems are worth 100 points each...');

  for (let i = 0; i < gems; i++) {
    state.stats.gems--;
    state.stats.score += 10;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage('Your Whips are worth 100 points each...');
  for (let i = 0; i < whips; i++) {
    state.stats.whips--;
    state.stats.score += 10;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage(
    'Your Teleport Scrolls are worth 200 points each...',
  );
  for (let i = 0; i < teleports; i++) {
    state.stats.teleports--;
    state.stats.score += 20;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage('Your Keys are worth 10,000 points each....');
  for (let i = 0; i < keys; i++) {
    state.stats.keys--;
    state.stats.score += 1000;
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
  state.game.done = true;
}

async function shoot(x: number, y: number, dx: number) {
  x += dx;
  while (x >= 0 && x <= XSize) {
    const block = state.level.map.getType(x, y);
    if (
      typeof block !== 'number' ||
      [
        Type.Block,
        Type.Stairs,
        Type.Door,
        Type.Wall,
        Type.Lava,
        Type.Tunnel,
        Type.IDoor,
        Type.Generator,
        Type.MBlock,
        Type.Tablet,
        Type.ZBlock,
        Type.Statue,
        ...OWALLS,
        Type.GBlock,
        Type.Rock,
        Type.EWall,
        Type.Amulet,
      ].includes(block)
    ) {
      // These objects stop the Spear
      break;
    }

    sound.play(x + 30, 10, 100);
    for (let b = 1; b < 6; b++) {
      screen.drawOver(x, y, '─', RNG.getUniformInt(0, 16));
      await delay(1);
    }

    if (
      ![
        Type.Floor,
        Type.River,
        Type.Pit,
        Type.Quake,
        Type.IBlock,
        Type.IWall,
        Type.Stop,
        Type.Trap2,
        Type.Trap3,
        Type.Trap4,
        Type.Trap5,
        Type.ShowGems,
        Type.BlockSpell,
        Type.WallVanish,
        ...CWALLS,
        ...CSPELLS,
        ...TBLOCKS,
        Type.Rope,
      ].includes(block as number)
    ) {
      // These objects are ignored
      await sound.play(300, 10, 10);
      if (block === Type.Slow || block === Type.Medium || block === Type.Fast) {
        await killAt(x, y);
      }
      state.level.map.setType(x, y, Type.Floor);
    }

    screen.drawEntity(x, y);
    x += dx;
  }
  screen.renderPlayfield();
}

async function gotAmulet() {
  await sound.grab();
  for (let x = 45; x >= 11; x--) {
    for (let y = 13; y >= 1; y--) {
      await sound.play(x * x * y, y + 1, 100);
    }
  }
  addScore(Type.Amulet);
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

async function playerBomb(x: number, y: number) {
  for (let i = 70; i <= 600; i++) {
    sound.play(i * 2, 3, 10);
    if (i % 10 === 0) await delay(1);
  }

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
        const block = (state.level.map.getType(x, y) as number) ?? Type.Floor;
        if (BOMBABLES.includes(block as number)) {
          if (block >= 1 && block <= 4) {
            addScore(block);
            killAt(x, y);
          }
        }
      }
    }
    await sound.play(30, 10, 10);
    await delay(20);
  }
  await delay(100);

  d = 4;
  const x1 = Math.max(x - d, XBot);
  const x2 = Math.min(x + d, XTop);
  const y1 = Math.max(y - d, YBot);
  const y2 = Math.min(y + d, YTop);

  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      const block = (state.level.map.getType(x, y) as number) ?? Type.Floor;
      if (BOMBABLES.includes(block as number)) {
        state.level.map.setType(x, y, Type.Floor);
      }
    }
  }
  screen.renderPlayfield();
}

async function playerTunnel(x: number, y: number, sx: number, sy: number) {
  await delay(350);
  await sound.footStep();
  await delay(500);
  state.level.map.setType(x, y, Type.Tunnel);
  screen.drawEntity(x, y);

  // Find a random tunnel
  let tx = x;
  let ty = y;
  for (let i = 0; i < 10000; i++) {
    const a = RNG.getUniformInt(0, XSize);
    const b = RNG.getUniformInt(0, YSize);
    const t = state.level.map.getType(a, b) ?? Type.Floor;
    if (t === Type.Tunnel && (a !== tx || b !== ty)) {
      tx = a;
      ty = b;
      state.level.player.move(tx, ty);
      break;
    }
  }

  state.level.map.setType(x, y, Type.Tunnel);
  screen.drawEntity(x, y);

  // Find a random empty space near exit
  let ex = sx;
  let ey = sy;
  for (let i = 0; i < 100; i++) {
    const a = RNG.getUniformInt(-1, 1);
    const b = RNG.getUniformInt(-1, 1);
    if (tx + a < 0 || tx + a > XSize || ty + b < 0 || ty + b > YSize) continue;
    const e = state.level.map.getType(tx + a, ty + b) ?? Type.Floor;
    if (
      [
        0, 32, 33, 37, 39, 55, 56, 57, 67, 224, 225, 226, 227, 227, 229, 230,
        231,
      ].includes(e as Type)
    ) {
      ex = tx + a;
      ey = ty + b;
      break;
    }
  }
  state.level.player.move(ex, ey);
  state.level.map.setType(tx, ty, Type.Tunnel);
  screen.drawEntity(tx, ty);
}

async function quakeTrap() {
  for (let i = 0; i < 2500; i++) {
    sound.play(RNG.getUniformInt(0, i), 5, 100);
    if (i % 25 === 0) await delay();
  }

  await delay(50);
  for (let i = 0; i < 50; i++) {
    do {
      const x = RNG.getUniformInt(0, XSize);
      const y = RNG.getUniformInt(0, YSize);
      const block = state.level.map.getType(x, y);
      if (ROCKABLES.includes(block as number)) {
        state.level.map.setType(x, y, Type.Rock);
        screen.drawEntity(x, y);
        break;
      }
    } while (Math.random() > 0.01);
    for (let i = 0; i < 50; i++) {
      sound.play(RNG.getUniformInt(0, 200), 50, 100);
    }
    await delay(50);
  }

  for (let i = 2500; i > 50; i--) {
    sound.play(RNG.getUniformInt(0, i), 5, 100);
    if (i % 25 === 0) await delay();
  }
}

async function zapTrap() {
  let t = 0;
  let k = 0;
  while (t < 500 && k < 40) {
    t++;
    const n = RNG.getUniformInt(0, state.level.entities.length);
    const e = state.level.entities[n];
    if (!e || e.x === -1 || e.y === -1) continue; // dead
    await killAt(e.x, e.y);
    screen.renderPlayfield();
    await delay(20);
    k++;
  }

  state.stats.score += Math.floor(k / 3 + 2);
  screen.renderPlayfield();
  screen.renderStats();
}

async function createTrap() {
  const SNum = state.level.entities.reduce((acc, e) => {
    if (e.type === Type.Slow) return acc + 1;
    return acc;
  }, 0);
  if (SNum < 945) {
    for (let i = 0; i < 45; i++) {
      await generateCreatures();
    }
  }
}

async function showGemsSpell() {
  for (let i = 0; i < state.game.difficulty * 2 + 5; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XSize);
      const y = RNG.getUniformInt(0, YSize);
      const block = state.level.map.getType(x, y);
      if (block === Type.Floor) {
        sound.play(RNG.getUniformInt(110, 1310), 7, 100);
        done = true;
        state.level.map.setType(x, y, Type.Gem);
        screen.drawEntity(x, y);
        await delay(99);
      }
    } while (!done && Math.random() > 0.01);
  }
  screen.renderPlayfield();
}

async function blockSpell() {
  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      if (state.level.map.getType(x, y) === Type.ZBlock) {
        sound.play(200, 60, 100);
        for (let i = 20; i > 0; i--) {
          screen.drawType(x, y, Type.Block, RNG.getUniformInt(0, 15));
          await delay(3);
        }
        state.level.map.setType(x, y, Type.Floor);
        screen.drawEntity(x, y);
      } else if (state.level.map.getType(x, y) === Type.BlockSpell) {
        state.level.map.setType(x, y, Type.Floor);
        screen.drawEntity(x, y);
      }
    }
  }
}

async function krozBonus(block: Type) {
  if (block === Type.K && state.level.bonus === 0) state.level.bonus = 1;
  if (block === Type.R && state.level.bonus === 1) state.level.bonus = 2;
  if (block === Type.O && state.level.bonus === 2) state.level.bonus = 3;
  if (block === Type.Z && state.level.bonus === 3) {
    await sound.bonusSound();
    addScore(block);
    await screen.flashTypeMessage(block);
  }
}

async function oSpell(block: Type) {
  let s = Type.OWall1;
  if (block === Type.OSpell2) s = Type.OWall2;
  if (block === Type.OSpell3) s = Type.OWall3;

  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      const block = state.level.map.getType(x, y);
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
        state.level.map.setType(x, y, Type.Floor);
        screen.drawEntity(x, y);
      }
    }
  }
}

async function cSpell(block: Type) {
  const s = block - Type.CSpell1 + Type.CWall1;

  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      const block = state.level.map.getType(x, y);
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
        state.level.map.setType(x, y, Type.Wall);
        screen.drawEntity(x, y);
      }
    }
  }
}

async function pushRock(x: number, y: number, dx: number, dy: number) {
  let nogo = false;

  const rx = state.level.player.x + dx * 2;
  const ry = state.level.player.y + dy * 2;
  if (rx < 0 || rx > XSize || ry < 0 || ry > YSize) nogo = true;

  if (!nogo) {
    const rb = state.level.map.getType(rx, ry); // TODO: other cases

    async function moveRock() {
      nogo = false;
      await sound.moveRock();
      state.level.map.setType(rx, ry, Type.Rock);
      state.level.player.move(x, y);
      screen.renderPlayfield();
      screen.renderPlayfield();
      await screen.flashTypeMessage(Type.Rock, true);
    }

    // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST5.MOV#L1366
    if (
      [
        Type.Floor,
        Type.Stop,
        Type.ShowGems,
        Type.BlockSpell,
        Type.WallVanish,
        ...CWALLS,
        ...CSPELLS,
        Type.Trap5,
        ...TBLOCKS,
        ...ITRAPS,
      ].includes(rb as number)
    ) {
      await moveRock();
    } else if (
      [
        ...COLLECTABLES,
        Type.Chest,
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
        ...ROPE_DROP,
        Type.ShootRight,
        Type.ShootLeft,
      ].includes(rb as number)
    ) {
      await moveRock();
      await sound.grab();
    } else if (MOBS.includes(rb as number)) {
      await moveRock();
      addScore(rb as Type);
      await sound.play(600, 20);
    } else if (rb === Type.EWall) {
      await moveRock();
      state.level.map.setType(rx, ry, Type.Floor);
      sound.play(90, 10, 10);
      await screen.flashMessage('The Boulder is vaporized!'); // TODO: show once
    } else if ([Type.Stairs, Type.Pit].includes(rb as number)) {
      nogo = false;
      await sound.moveRock();
      state.level.player.move(x, y);
      screen.renderPlayfield();
      screen.renderPlayfield();
      screen.drawType(rx, ry, Type.Rock);
      for (let i = 130; i > 5; i--) {
        await sound.play(i * 8, 16, 100);
      }
      screen.renderPlayfield();
      await screen.flashTypeMessage(Type.Rock, true);
    }
  }

  if (nogo) {
    await sound.blocked();
  }
}

function aTrap(block: Type) {
  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      const a = state.level.map.getType(x, y);
      if (block === a) {
        state.level.map.setType(x, y, Type.Floor);
        screen.drawEntity(x, y);
      }
    }
  }
}

async function messageInTheTree() {
  for (let i = 20; i < 8000; i++) {
    sound.play(i, 1, 100);
  }
  await delay(100);
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

const B = [
  Type.Floor,
  Type.Stop,
  ...ITRAPS,
  Type.ShowGems,
  Type.WallVanish,
  ...TBLOCKS,
];
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

        const b = state.level.map.getType(x + dx, y + dy);
        if (B.includes(b as Type)) {
          screen.drawType(x + dx, y + dy, t, fg, bg);
          if (place) state.level.map.setType(x + dx, y + dy, t);
        }
        await delay(5);
      }
    }
  }
}
