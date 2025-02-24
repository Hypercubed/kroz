import * as world from '../modules/world';
import * as sound from '../modules/sound';
import * as player from './player-system';

import { TIME_SCALE, XMax, YMax } from '../constants/constants';
import type { Entity } from '../classes/entity';
import {
  Attacks,
  Eats,
  followsPlayer,
  DestroyedBy,
  Position,
  Renderable,
  Walkable,
  AnimatedWalking,
  isInvisible,
  Speed
} from '../classes/components';
import { Timer } from '../modules/effects';
import { Type } from '../constants/types';

export async function update(tick: number) {
  if (world.levelState.T[Timer.FreezeTime] > 0) return;

  for (const e of world.levelState.entities) {
    const speed = e.get(Speed);
    if (!speed) continue;
    let pace =
      world.levelState.T[Timer.SpeedTime] > 0
        ? speed.hastedPace
        : speed.basePace;
    if (world.levelState.T[Timer.SlowTime] > 0) pace = 2 * pace;
    const p = pace * TIME_SCALE;
    if (tick % p === p - 1) await act(e);
  }
}

async function act(e: Entity) {
  const ep = e.get(Position)!;
  if (ep.isDead()) return;

  if (
    world.levelState.map.getType(ep.x, ep.y) !== (e.type as unknown as Type)
  ) {
    world.kill(e);
    return;
  } // dead

  if (e.has(followsPlayer)) {
    let dx = 0;
    let dy = 0;

    const pp = world.levelState.player.get(Position)!;

    if (pp.x < ep.x) dx = -1;
    if (pp.x > ep.x) dx = 1;
    if (pp.y < ep.y) dy = -1;
    if (pp.y > ep.y) dy = 1;

    await tryMove(e, dx, dy);
  }
}

async function tryMove(e: Entity, dx: number, dy: number) {
  const ep = e.get(Position)!;

  const x = ep.x + dx;
  const y = ep.y + dy;

  if (x < 0 || x > XMax || y < 0 || y > YMax) return;

  const block = world.levelState.map.get(x, y);
  if (!block) return;

  if (e.get(Eats)?.has(block.type)) {
    sound.grab();
    moveTo(e, x, y);
    return;
  }

  if (block.get(Walkable)?.by(e.type)) {
    moveTo(e, x, y);
    return; // TODO: change this to fall through
  }

  if (e.get(DestroyedBy)?.has(block.type)) {
    world.setTypeAt(ep.x, ep.y, Type.Floor);
    world.setTypeAt(x, y, Type.Floor);
    world.kill(e);
    world.addScore(block.type as Type);
    sound.play(800, 18);
    sound.play(400, 20);
    return;
  }

  if (e.has(Attacks) && block.type === Type.Player) {
    const damage = e.get(Attacks)!.damage;
    world.stats.gems -= damage;
    world.setTypeAt(ep.x, ep.y, Type.Floor);
    world.kill(e);
    world.addScore(block.type as Type);

    if (world.stats.gems < 0) await player.dead();
    return;
  }

  // Stay in place
  moveTo(e, ep.x, ep.y);
}

export function moveTo(e: Entity, x: number, y: number) {
  if (e.has(AnimatedWalking) && e.has(Renderable)) {
    const r = e.get(Renderable)!;
    const a = e.get(AnimatedWalking)!;
    r.ch = a.getFrame();
  }

  const p = e.get(Position)!;

  if (e.type === Type.MBlock && (x !== p.x || y !== p.y)) {
    // TODO: can this be applied to all entities?
    e.remove(isInvisible);
  }

  world.setTypeAt(p.x, p.y, Type.Floor);
  world.levelState.map.set(x, y, e);
  p.moveTo(x, y);
}
