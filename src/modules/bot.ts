import { Path, RNG } from 'rot-js';

import * as world from './world';
import * as player from './player-system';
import * as effects from './effects';
import * as tiles from '../data/tiles';
import * as events from './events';

import { COLLECTABLES, KROZ, MOBS, OSPELLS, TRAPS, Type } from '../data/tiles';
import type { Entity } from '../classes/entity';
import {
  Collectible,
  isPassable,
  isPushable,
  Position,
} from '../classes/components';

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
];

const BREAKABLES = [
  Type.Block,
  Type.Forest,
  Type.Tree,
  Type.Rock,
  Type.Generator,
  ...TRAPS,
];

type Moves = [Entity, number, number];
type Weights = Record<string, number>;

// TODO: Reset on level change
const VISITED = new Map<string, number>();

 
let lastAction: string | null = null;

events.levelStart.add(() => {
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
  return e?.has(isPassable) && e?.type !== Type.Pit;
}

function getUnexploredNeighborhood(x: number, y: number) {
  const n = getNeighbors(x, y);
  return n.filter((n) => {
    const [e, xx, yy] = n;
    if (!isWalkable(e)) return false;
    const id = `${xx}.${yy}`;
    return !VISITED.has(id);
  });
}

function chebyshevDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

async function pickMove(moves: Weights): Promise<boolean> {
  const p = world.level.player.get(Position)!;
  if (!p) return false;

  const id = RNG.getWeightedValue(moves);
  if (id) {
    const [x, y] = id.split('.');
    await tryMove(+x, +y);
    return true;
  }
  return false;
}

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

function getPaths(m: Moves) {
  const p = world.level.player.get(Position)!;
  const dijkstra = new Path.Dijkstra(m[1], m[2], passableCallback, {
    topology: 8,
  });

  const path: Array<[number, number]> = [];
  dijkstra.compute(p.x, p.y, (x, y) => {
    path.push([x, y]);
  });
  return path;

  function passableCallback(x: number, y: number) {
    if (x === m[1] && y === m[2]) return true;
    if (x === p.x && y === p.y) return true;

    const e = world.level.map.get(x, y);
    if (!e) return false;
    // if (e.type === Type.Block && world.stats.whips > 1) return true;
    return isWalkable(e);
  }
}

async function tryStairs(): Promise<boolean> {
  const stairs = getTargets((e) => e.type === Type.Stairs);
  if (stairs.length < 1) return false;

  const paths = stairs.map(getPaths);
  const scores = stairs.map((_, i) => {
    if (paths[i].length < 2) return 0;
    return 1 / (paths[i].length + 1);
  });

  const maxScore = Math.max(...scores);
  const index = scores.indexOf(maxScore);
  const path = paths[index];
  if (!path || path.length < 2) return false;

  const [x, y] = path[1];

  lastAction = 'stairs';
  console.log(lastAction);
  return await tryMove(+x, +y);
}

const D = 10000;
async function tryCollect() {
  const collectables = getTargets(
    (e) =>
      COLLECT.includes(e.type as Type) ||
      e.has(Collectible) ||
      e?.type === Type.Tablet,
  );
  if (collectables.length < 1) return false;

  const paths = collectables.map(getPaths);
  const scores = collectables.map((n, i) => {
    if (!paths[i] || paths[i].length < 2) return 0;
    return D / (paths[i].length + 1) + tiles.getScoreDelta(n[0].type as Type);
  });

  const maxScore = Math.max(...scores);
  const index = scores.indexOf(maxScore);
  const path = paths[index];
  if (!path || path.length < 2) return false;

  const [x, y] = path[1];

  console.log((lastAction = 'collect'));
  return await tryMove(+x, +y);
}

async function tryDoor() {
  if (world.stats.keys < 1) return false;

  const doors = getTargets((e) => e.type === Type.Door);
  if (doors.length < 1) return false;

  const paths = doors.map(getPaths);
  const scores = doors.map((_, i) => {
    if (paths[i].length < 1) return 0;
    return 1 / (paths[i].length + 1);
  });

  const maxScore = Math.max(...scores);
  const index = scores.indexOf(maxScore);
  const path = paths[index];
  if (!path || path.length < 1) return false;

  const [x, y] = path[1];

  console.log((lastAction = 'door'));
  return await tryMove(+x, +y);
}

async function tryBreak() {
  if (world.stats.whips < 1) return false;

  const breakables = getTargets((e) => BREAKABLES.includes(e.type as Type));
  if (breakables.length < 1) return false;

  const paths = breakables.map(getPaths);
  const scores = breakables.map((_, i) => {
    if (paths[i].length < 1) return 0;
    return 1 / (paths[i].length + 1);
  });

  const maxScore = Math.max(...scores);
  const index = scores.indexOf(maxScore);
  const path = paths[index];
  if (!path) return false;
  if (path.length < 2) {
    console.log((lastAction = 'break'));
    world.stats.whips--;
    return await effects.whip();
  }

  const [x, y] = path[1];

  const p = world.level.player.get(Position)!;
  if (!p) return false;
  if (x === p.x && y === p.y) {
    console.log((lastAction = 'break'));
    world.stats.whips--;
    return await effects.whip();
  }

  console.log((lastAction = 'break'));
  return await tryMove(+x, +y);
}

async function tryExploreWide() {
  const unvisited = getTargets((e, x, y) => {
    const visited = VISITED.get(`${x}.${y}`);
    return !visited && isWalkable(e);
  });
  if (unvisited.length < 1) return false;

  const paths = unvisited.map(getPaths);
  const scores = unvisited.map((n, i) => {
    const unexploredNeighbors = getUnexploredNeighborhood(n[1], n[2]);
    return 1 / (paths[i].length + 1) + unexploredNeighbors.length;
  });

  const maxScore = Math.max(...scores);
  const index = scores.indexOf(maxScore);
  const path = paths[index];
  if (!path || path.length < 1) return false;
  const [x, y] = path[1];

  console.log((lastAction = 'exploreWide'));
  return await tryMove(+x, +y);
}

async function tryExploreClose() {
  const p = world.level.player.get(Position)!;
  if (!p) return false;

  const unexploredNeighbors = getUnexploredNeighborhood(p.x, p.y);
  if (unexploredNeighbors.length < 1) return false;

  const weights = unexploredNeighbors.reduce(
    (acc, n) => {
      const [, x, y] = n;
      const u = getUnexploredNeighborhood(x, y);
      acc[`${x}.${y}`] = u.length + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log((lastAction = 'explore'));
  return pickMove(weights);
}

async function tryPush() {
  // TODO: Need to avoid pushing rocks that cannot be pushed
  const p = world.level.player.get(Position)!;
  if (!p) return false;

  const rocks = neighbors.filter((n) => n[0]?.has(isPushable));
  if (rocks.length < 1) return false;

  const weights = rocks.reduce((acc, n) => {
    const [, x, y] = n;
    acc[`${x}.${y}`] = 1 / (chebyshevDistance(p.x, p.y, x, y) + 1);
    return acc;
  }, {} as Weights);

  console.log((lastAction = 'push'));
  return pickMove(weights);
}

async function tryWhip() {
  if (world.stats.whips < 1) return false;
  if (Math.random() > 0.05 * world.stats.whips) return false;

  const p = world.level.player.get(Position)!;
  if (!p) return;

  const breakable = neighbors.filter((n) =>
    BREAKABLES.includes(n[0]?.type as Type),
  );
  if (breakable.length < 1) return false;

  console.log((lastAction = 'whip'));
  world.stats.whips--;
  await effects.whip();
  return true;
}

async function tryTeleport() {
  if (world.stats.teleports < 1) return false;
  if (Math.random() > 0.01 * world.stats.teleports) return false;

  console.log((lastAction = 'teleport'));
  world.stats.teleports--;
  await effects.teleport();
  return true;
}

async function trySearchClose() {
  const p = world.level.player.get(Position)!;
  if (!p) return;

  const emptySpace = neighbors.filter((m) => isWalkable(m[0]));
  if (emptySpace.length < 1) return false;

  const weights = emptySpace.reduce((acc, n) => {
    const [, x, y] = n;
    const id = `${x}.${y}`;
    const visits = VISITED.get(id) || 0.001;
    acc[`${x}.${y}`] = 1 / visits;
    return acc;
  }, {} as Weights);

  console.log((lastAction = 'searchClose'));
  return pickMove(weights);
}

async function trySearchWide() {
  const emptySpaces = getTargets((e) => isWalkable(e));
  if (emptySpaces.length < 1) return false;

  const paths = emptySpaces.map(getPaths);
  const scores = emptySpaces.map((n, i) => {
    if (paths[i].length < 1) return 0;
    const [, x, y] = n;
    const visits = VISITED.get(`${x}.${y}`) || 0.001;
    return 1 / (paths[i].length + 1) + 1 / visits;
  });

  const maxScore = Math.max(...scores);
  const index = scores.indexOf(maxScore);
  const path = paths[index];
  if (!path || path.length < 1) return false;
  const [x, y] = path[1];

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
  await effects.whip();
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
  if (await tryDoor()) return;
  if (await tryExploreClose()) return;
  if (await tryPush()) return;
  if (await tryWhip()) return;
  if (await tryBreak()) return;
  if (await tryTeleport()) return;
  if (await tryExploreWide()) return;
  if (await trySearchClose()) return;
  if (await trySearchWide()) return;
  return;
}

async function tryMove(x: number, y: number) {
  const p = world.level.player.get(Position)!;
  if (!p) return false;
  const id = `${x}.${y}`;
  const visited = VISITED.get(id);
  VISITED.set(id, visited ? visited + 1 : 1);
  await player.tryMove(+x - p.x, +y - p.y);
  return true;
}
