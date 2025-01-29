import * as world from './world';
import * as player from './player-system';
import * as effects from './effects';
import * as events from './events';

import { COLLECTABLES, KROZ, MOBS, OSPELLS, Type } from '../data/tiles';
import type { Entity } from '../classes/entity';
import {
  Breakable,
  Collectible,
  isMob,
  isPassable,
  isPushable,
  Position,
} from '../classes/components';
import { astar } from '../utils/astar';

const COLLECT = [
  ...COLLECTABLES,
  Type.Key,
  Type.Nugget,
  Type.Amulet,
  Type.Tablet,
  Type.SlowTime,
  Type.Zap,
  ...KROZ,
  Type.Freeze,
  Type.ShootRight,
  Type.ShootLeft,
  ...OSPELLS,
  Type.Tome,
  Type.Bomb,
];

type Moves = [Entity, number, number];

const VISITED = new Map<string, number>();

let lastAction: string | null = null;

events.levelStart.add(() => {
  console.log(lastAction);
  VISITED.clear();
});

let neighbors = [] as Array<Moves>;

function getNeighbors(x: number, y: number) {
  const n: Array<Moves> = [];
  const R = 1;
  for (let dx = -R; dx <= R; dx++) {
    for (let dy = -R; dy <= R; dy++) {
      const [xx, yy] = [x + dx, y + dy];
      const e = world.level.map.get(xx, yy);
      if (!e) continue;
      n.push([e, xx, yy]);
    }
  }
  return n;
}

function isWalkable(e: Entity) {
  if (!e) return true;
  if (e?.type === Type.Pit) return false;
  return e?.has(isPassable);
}

function chebyshevDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

// async function pickMove(moves: Weights): Promise<boolean> {
//   const p = world.level.player.get(Position)!;
//   if (!p) return false;

//   const id = RNG.getWeightedValue(moves);
//   if (id) {
//     const [x, y] = id.split('.');
//     await tryMove(+x, +y);
//     return true;
//   }
//   return false;
// }

function getTargets(predicate: (e: Entity, x: number, y: number) => boolean) {
  const map = world.level.map;
  const arr = [] as Array<Moves>;
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      const e = world.level.map.get(x, y);
      if (!e) continue;
      if (predicate(e, x, y)) {
        arr.push([e, x, y]);
      }
    }
  }
  return arr;
}

function getPath(goals: Array<[number, number]>): Array<[number, number]> {
  const p = world.level.player.get(Position)!;
  const path = astar(p.x, p.y, passableCallback, hurestic, cost);

  // for (let i = 0; i < path.length; i++) {
  //   const [x, y] = path[i];
  //   display.drawOver(x, y, '*', 'red');
  // }

  return path;

  function hurestic(x: number, y: number) {
    return goals.reduce((acc, goal) => {
      const d = chebyshevDistance(x, y, goal[0], goal[1]);
      return Math.min(acc, d);
    }, Infinity);
  }

  function cost(x: number, y: number) {
    const e = world.level.map.get(x, y);
    if (!e) return 1;
    if (e.has(isPushable)) return 300; // Weight by number of whips?
    if (e.has(Breakable)) return 10; // Weight by number of whips?
    if (e.has(isMob)) return 20; // Weight by number of gems?
    if (e.type === Type.Door) return 50; // Weight by number of gems?
    if (e.type === Type.Door) return 50; // Weight by number of keys?
    return 1; // / (getScoreDelta(e.type as Type) + 1) + 1;
  }

  function passableCallback(x: number, y: number) {
    if (x < 0 || y < 0) return false;
    if (x >= world.level.map.width || y >= world.level.map.height) return false;

    if (x === goals[0][0] && y === goals[0][1]) return true;
    if (x === p.x && y === p.y) return true;

    const e = world.level.map.get(x, y);
    if (!e) return true;
    if (e.has(Breakable)) return world.stats.whips > 0;
    if (e.has(isMob)) return world.stats.gems > 0;
    if (e.type === Type.Door) return world.stats.keys > 0;
    return isWalkable(e);
  }
}

function getStepToward(goals: Array<[number, number]>) {
  const path = getPath(goals);
  if (!path || path.length < 1) return null;
  path.pop();
  return path.pop()!;
}

async function tryStairs(): Promise<boolean> {
  const stairs = getTargets((e) => e.type === Type.Stairs);
  if (stairs.length < 1) return false;

  const goals: Array<[number, number]> = stairs.map((n) => [n[1], n[2]]);
  const step = getStepToward(goals);
  if (!step) return false;
  const [x, y] = step;
  console.log((lastAction = 'stairs'));
  return await tryMove(+x, +y);
}

// const D = 10000;
async function tryCollect() {
  const collectables = getTargets(
    (e) => COLLECT.includes(e.type as Type) || e.has(Collectible),
  );
  if (collectables.length < 1) return false;

  const goals: Array<[number, number]> = collectables.map((n) => [n[1], n[2]]);
  const step = getStepToward(goals);
  if (!step) return false;
  const [x, y] = step;
  console.log((lastAction = 'collect'));
  return await tryMove(+x, +y);
}

async function tryDoor() {
  if (world.stats.keys < 1) return false;

  const doors = getTargets((e) => e.type === Type.Door);
  if (doors.length < 1) return false;

  const goals: Array<[number, number]> = doors.map((n) => [n[1], n[2]]);
  const step = getStepToward(goals);
  if (!step) return false;
  const [x, y] = step;

  console.log((lastAction = 'door'));
  return await tryMove(+x, +y);
}

// async function tryBreak() {
//   if (world.stats.whips < 1) return false;

//   const breakables = getTargets((e) => BREAKABLES.includes(e.type as Type));
//   if (breakables.length < 1) return false;

//   const paths = breakables.map(getPaths);
//   const scores = breakables.map((_, i) => {
//     if (paths[i].length < 1) return 0;
//     return 1 / (paths[i].length + 1);
//   });

//   const maxScore = Math.max(...scores);
//   const index = scores.indexOf(maxScore);
//   const path = paths[index];
//   if (!path) return false;
//   if (path.length < 2) {
//     console.log((lastAction = 'break'));
//     world.stats.whips--;
//     return await effects.whip(world.level.player);
//   }

//   const [x, y] = path[1];

//   const p = world.level.player.get(Position)!;
//   if (!p) return false;
//   if (x === p.x && y === p.y) {
//     console.log((lastAction = 'break'));
//     world.stats.whips--;
//     return await effects.whip(world.level.player);
//   }

//   console.log((lastAction = 'break'));
//   return await tryMove(+x, +y);
// }

async function tryExplore() {
  const unvisited = getTargets((e, x, y) => {
    const visited = VISITED.get(`${x}.${y}`);
    return !visited && isWalkable(e);
  });
  if (unvisited.length < 1) return false;

  const goals: Array<[number, number]> = unvisited.map((n) => [n[1], n[2]]);
  const step = getStepToward(goals);
  if (!step) return false;
  const [x, y] = step;

  console.log((lastAction = 'explore'));
  return await tryMove(+x, +y);
}

async function tryPush() {
  const rocks = neighbors.filter((n) => n[0]?.has(isPushable));
  if (rocks.length < 1) return false;

  const goals: Array<[number, number]> = rocks.map((n) => [n[1], n[2]]);
  const step = getStepToward(goals);
  if (!step) return false;
  const [x, y] = step;

  console.log((lastAction = 'push'));
  return await tryMove(+x, +y);
}

async function tryTeleport() {
  if (world.stats.teleports < 1) return false;
  if (Math.random() > 0.01 * world.stats.teleports) return false;

  console.log((lastAction = 'teleport'));
  world.stats.teleports--;
  await effects.teleport(world.level.player);
  return true;
}

async function trySearch() {
  const p = world.level.player.get(Position)!;
  if (!p) return;

  const emptySpace = neighbors.filter((m) => isWalkable(m[0]));
  if (emptySpace.length < 1) return false;

  const goals: Array<[number, number]> = emptySpace.map((n) => [n[1], n[2]]);
  const step = getStepToward(goals);
  if (!step) return false;
  const [x, y] = step;

  console.log((lastAction = 'search'));
  return await tryMove(+x, +y);
}

async function tryDefend() {
  if (world.stats.whips < 1) return false;

  const p = world.level.player.get(Position)!;
  if (!p) return;

  const mobs = neighbors.filter((n) => MOBS.includes(n[0]?.type as Type));
  if (mobs.length < 1) return false;
  if (mobs.length > 5 * world.stats.whips) return false;

  console.log((lastAction = 'defend'));
  world.stats.whips--;
  await effects.whip(world.level.player);
  return true;
}

// Random Bot
export async function botPlay() {
  const p = world.level.player.get(Position)!;
  if (!p) return;

  neighbors = getNeighbors(p.x, p.y);

  if (await tryDefend()) return;
  if (await tryStairs()) return;
  if (await tryCollect()) return;
  if (await tryPush()) return;
  if (await tryExplore()) return;
  if (await tryDoor()) return;
  if (await tryTeleport()) return;
  if (await trySearch()) return;
  return;
}

async function tryMove(x: number, y: number) {
  const p = world.level.player.get(Position)!;
  if (!p) return false;
  const id = `${x}.${y}`;
  const visited = VISITED.get(id);
  VISITED.set(id, visited ? visited + 1 : 1);

  const b = world.level.map.get(x, y);
  if (b?.has(Breakable) && world.stats.whips > 0) {
    world.stats.whips--;
    await effects.whip(world.level.player);
    return true;
  }

  await player.tryMove(+x - p.x, +y - p.y);
  return true;
}
