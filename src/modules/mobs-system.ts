import * as world from './world';
import * as sound from './sound';
import * as player from './player-system';

import { Type } from '../data/tiles';
import { TIME_SCALE, XMax, YMax } from '../data/constants';
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
  Speed,
} from '../classes/components';
import { Timer } from './effects';

export async function update(tick: number) {
  if (world.level.T[Timer.FreezeTime] > 0) return;

  for (const e of world.level.entities) {
    const speed = e.get(Speed);
    if (!speed) continue;
    let pace =
      world.level.T[Timer.SpeedTime] > 0 ? speed.hastedPace : speed.basePace;
    if (world.level.T[Timer.SlowTime] > 0) pace = 2 * pace;
    const p = pace * TIME_SCALE;
    if (tick % p === p - 1) await act(e);
  }
}

async function act(e: Entity) {
  const ep = e.get(Position)!;
  if (ep.isDead()) return;

  if (world.level.map.getType(ep.x, ep.y) !== (e.type as unknown as Type)) {
    world.kill(e);
    return;
  } // dead

  if (e.has(followsPlayer)) {
    let dx = 0;
    let dy = 0;

    const pp = world.level.player.get(Position)!;

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

  const block = world.level.map.get(x, y);
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
    world.level.map.setType(ep.x, ep.y, Type.Floor);
    world.level.map.setType(x, y, Type.Floor);
    world.kill(e);
    world.addScore(block.type as Type);
    sound.play(800, 18);
    sound.play(400, 20);
    return;
  }

  if (e.has(Attacks) && block.type === Type.Player) {
    const damage = e.get(Attacks)!.damage;
    world.stats.gems -= damage;
    world.level.map.setType(ep.x, ep.y, Type.Floor);
    world.kill(e);
    world.addScore(block.type as Type);

    if (world.stats.gems < 0) await player.dead();
    return;
  }

  // Stay in place
  moveTo(e, ep.x, ep.y);
}

function moveTo(e: Entity, x: number, y: number) {
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

  world.level.map.setType(p.x, p.y, Type.Floor);
  world.level.map.set(x, y, e);
  p.moveTo(x, y);
}
