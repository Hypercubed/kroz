import * as tiled from '@kayahr/tiled';
import { RNG } from 'rot-js';

import * as tiles from '../modules/tiles';

import { Type } from '../constants/types';
import { Matrix } from '../classes/map';
import { Entity } from '../classes/entity';
import { PlayField } from '../classes/play-field';
import { readTileMapLayers } from './tiled';
import Cellular from 'rot-js/lib/map/cellular';
import { Rogue } from 'procedural-layouts';

export const DIRS4 = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
];

export const DIRS8 = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1]
];

export enum LayerType {
  Fill,
  Prefab,
  CA,
  Generator,
  Brogue
}

type WeightedType = { [key in Type]?: number };

interface FillLayer {
  type: LayerType.Fill;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  tiles: Type | WeightedType;
}

interface PrefabLayer {
  type: LayerType.Prefab;
  readMap: () => Promise<tiled.Map> | tiled.Map;
}

export interface CALayer {
  type: LayerType.CA;
  tileType: Type;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  interations?: number;
  randomize?: number;
  checkPath?: boolean;
  retry?: number;
  allowedPlacement?: Type[];
  maxPlacement?: number;
}

export interface GeneratorLayer {
  type: LayerType.Generator;
  gen: (map: Matrix<Entity>, x: number, y: number, depth: number) => void;
  n: (depth: number) => number;
}

export interface BrogueLayer {
  type: LayerType.Brogue;
  maxKeys?: number;
  wallType?: Type | WeightedType;
  voidType?: Type | WeightedType;
  special?: boolean;
  width?: number;
  height?: number;
  max_width?: number;
  max_height?: number;
  min_width?: number;
  min_height?: number;
  ideal?: number;
  doorWeights?: { [key in Type]?: number };
  // TODO: max/min Keys
}

export type Layer =
  | FillLayer
  | PrefabLayer
  | CALayer
  | GeneratorLayer
  | BrogueLayer;

export interface LevelDefinition {
  layers: Layer[];
  properties?: Record<string, unknown>;
}

// **********************

export async function generateMap(level: LevelDefinition, depth: number) {
  const mapData = new PlayField();
  const meta: Record<string, unknown> = { depth };

  mapData.fill(() => tiles.createEntityOfType(Type.Floor));

  for (const layer of level.layers) {
    switch (layer.type) {
      case LayerType.Fill:
        addFillLayer(layer, mapData);
        break;
      case LayerType.Prefab:
        await addPrefabLayer(layer, mapData);
        break;
      case LayerType.CA:
        addCALayer(layer, mapData);
        break;
      case LayerType.Generator:
        addGeneratorLayer(layer, mapData, meta);
        break;
      case LayerType.Brogue:
        addBrogueLayer(layer, mapData, meta);
        break;
    }
  }

  return { mapData, meta };
}

function addFillLayer(layerData: FillLayer, mapData: PlayField) {
  const x0 = layerData.x ?? 0;
  const y0 = layerData.y ?? 0;
  const x1 = x0 + (layerData.width ?? mapData.width);
  const y1 = y0 + (layerData.height ?? mapData.height);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      let t = layerData.tiles;
      if (typeof layerData.tiles === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t = RNG.getWeightedValue(t as any) as unknown as Type;
      }
      mapData.set(x, y, tiles.createEntityOfType(t as Type, x, y));
    }
  }
}

async function addPrefabLayer(layerData: PrefabLayer, mapData: PlayField) {
  const tilemap = await layerData.readMap();
  const data = readTileMapLayers(tilemap);

  const m = new Matrix<Entity>(mapData.width, mapData.height);
  m.fromArray(data);

  m.forEach((x, y, e) => {
    if (e) mapData.set(x, y, e);
  });
}

const DefaultAllowPlacement = [
  Type.Floor,
  Type.Wall,
  Type.Block,
  Type.GBlock,
  Type.Tree,
  Type.Forest
];

// - Generate a passable map from mapData once
function addCALayer(layerData: CALayer, mapData: Matrix<Entity>) {
  const w = layerData.width ?? mapData.width;
  const h = layerData.height ?? mapData.height;
  const interations = layerData.interations ?? 4;
  const randomize = layerData.randomize ?? 0.5;
  const allowedPlacement = layerData.allowedPlacement ?? DefaultAllowPlacement;

  let retry = layerData.retry ?? 100;
  let max = layerData.maxPlacement ?? 1;

  const passableMap = mapData.map((e) =>
    isTilePassable(e?.type ?? null) ? 0 : 1
  );
  // console.log('Passable Map');
  // console.log(passableMap.toMapString());

  while (max-- > 0) {
    while (retry-- > 0) {
      const map = buildMap();
      const p = findPostion(map);
      if (!p) continue;
      const [x0, y0] = p;

      map._serviceCallback((x: number, y: number, contents: number) => {
        if (contents === 0) return;
        const [xx, yy] = [x + x0, y + y0];
        const e = tiles.createEntityOfType(layerData.tileType, xx, yy);
        mapData.set(xx, yy, e);
      });
      // console.log('Map Built');

      break;
    }
  }

  function findPostion(map: Cellular) {
    const dx = mapData.width - w;
    const dy = mapData.height - h;

    let r = layerData.retry ?? 100;

    while (r-- > 0) {
      const x0 = RNG.getUniformInt(0, dx);
      const y0 = RNG.getUniformInt(0, dy);

      if (checkPaths(map, x0, y0)) {
        return [x0, y0];
      }
    }
    return false;
  }

  function buildMap(): Cellular {
    const map = new Cellular(w, h);
    map.randomize(randomize);
    for (let i = 0; i < interations; i++) {
      map.create();
    }
    return map;
  }

  function checkPaths(map: Cellular, x0: number, y0: number) {
    // Check allowed placement
    if (allowedPlacement && allowedPlacement.length) {
      for (let y = 0; y < map._height; y++) {
        for (let x = 0; x < map._width; x++) {
          const p = map._map[x][y];
          if (p === 0) continue;
          const [xx, yy] = [x + x0, y + y0];

          const e = mapData.get(xx, yy);
          if (e && !allowedPlacement.includes(e.type)) {
            return false;
          }
        }
      }
    }

    if (layerData.checkPath) {
      const m = passableMap.clone();
      map._serviceCallback((x: number, y: number, contents: number) => {
        if (contents === 0) return;
        const [xx, yy] = [x + x0, y + y0];
        m.set(xx, yy, 1);
      });
      // console.log('With Lake');
      // console.log(m.toMapString());

      floodFill(m);
      // console.log('After Fill');
      // console.log(m.toMapString());

      // Check if there are any 0s left
      for (let y = 0; y < m.height; y++) {
        for (let x = 0; x < m.width; x++) {
          if (m.get(x, y) === 0) {
            return false;
          }
        }
      }
    }

    return true;
  }

  // TODO: Make this a method on Matrix
  function floodFill(m: Matrix<number>) {
    let startX = 0;
    let startY = 0;

    // Find a starting point
    for (let y = 0; y < m.height; y++) {
      for (let x = 0; x < m.width; x++) {
        if (m.get(x, y) === 0) {
          startX = x;
          startY = y;
          break;
        }
      }
    }

    const stack = [[startX, startY]];
    while (stack.length) {
      const current = stack.pop()!;
      const [x, y] = current;
      m.set(x, y, 1);

      for (let i = 0; i < DIRS8.length; i++) {
        const [dx, dy] = DIRS8[i];
        const [xx, yy] = [x + dx, y + dy];
        if (m.get(xx, yy) === 0) {
          stack.push([xx, yy]);
        }
      }
    }
  }
}

function addGeneratorLayer(
  layerData: GeneratorLayer,
  mapData: Matrix<Entity>,
  meta: Record<string, unknown>
) {
  const depth = (meta.depth as number) ?? 0;
  let n = ~~layerData.n(depth);

  if (n < 1) return;
  while (n--) {
    const p = getRandPosition();
    if (!p) break;
    layerData.gen(mapData, p[0], p[1], depth);
  }

  function getRandPosition(): [number, number] | null {
    let m = 1000;
    while (m--) {
      const x = RNG.getUniformInt(0, mapData.width - 1);
      const y = RNG.getUniformInt(0, mapData.height - 1);
      if (mapData.get(x, y)!.type === Type.Floor) {
        return [x, y];
      }
    }
    return null;
  }
}

const CHANCE_TO_ADD_LOCK = 0.3; // At 1 this is 100% chance to add a lock in the current room
const CHANCE_TO_ADD_KEY = 0.3; // At 1 this is 100% chance to add a key in the next room

const DoorKeyPairs = {
  [Type.Door]: Type.Key,
  [Type.OWall1]: Type.OSpell1,
  [Type.OWall2]: Type.OSpell2,
  [Type.OWall3]: Type.OSpell3
};

const DefaultDoorWeights = {
  [Type.Door]: 70,
  [Type.OSpell1]: 15,
  [Type.OSpell2]: 10,
  [Type.OSpell3]: 5
};

function addBrogueLayer(
  layerData: BrogueLayer,
  mapData: Matrix<Entity>,
  meta: Record<string, unknown>
) {
  const maxKeys = layerData.maxKeys ?? 5;
  const width = layerData.width ?? mapData.width;
  const height = layerData.height ?? mapData.height;
  let max_width = layerData.max_width ?? 25;
  let max_height = layerData.max_height ?? 25;
  const min_width = layerData.min_width ?? 2;
  const min_height = layerData.min_height ?? 2;
  let ideal = layerData.ideal ?? 70;

  const btl = buildMap();

  mapData.fill((x, y) => {
    const t = btl.world[y][x];
    return tiles.createEntityOfType(rogueMapTypeToType(t), x, y);
  });

  addKeys();

  Object.assign(meta, btl);

  function rogueMapTypeToType(c: number | null): Type {
    switch (c) {
      case 0: // Void
        return getType(layerData.voidType ?? Type.Stop);
      case 1:
        return Type.Floor;
      case 2: // Wall
        return getType(layerData.wallType ?? Type.Wall);
      case 3: // Door
        return Type.Floor;
      case 4: // SPECIAL DOOR
        return Type.Door;
      case 5: // Enter
        return Type.Player;
      case 6: // Exit
        return Type.Stairs;
      case 7: // Key
        return Type.Key;
      default:
        return Type.Floor;
    }
  }

  function buildMap(): RogueMap {
    let btl: RogueMap | null = null;

    while (!btl) {
      try {
        const rogue = new Rogue({
          width,
          height,
          retry: 100,
          special: layerData.special ?? false,
          room: {
            ideal,
            min_width,
            max_width,
            min_height,
            max_height
          }
        });
        btl = rogue.build();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        ideal = 35;
        max_width--;
        max_height--;
      }
    }

    return btl!;
  }

  function addKeys() {
    const doorWeights = (layerData.doorWeights ?? DefaultDoorWeights) as {
      [key: number]: number;
    };

    const roomPool = [btl!.enter.room_id];

    queueRooms(btl!.enter.room_id);

    const lockDoors: number[] = [];
    const keyRooms: number[] = [];

    while (lockDoors.length < maxKeys && roomPool.length > 0) {
      const roomId = roomPool.pop();
      if (!roomId) break;

      if (Math.random() < CHANCE_TO_ADD_LOCK) {
        const room = btl!.rooms[roomId];

        const door = RNG.getItem(room.doors);
        if (!door) continue;
        if (lockDoors.includes(door)) continue; // Already has a lock

        let i = roomPool.length;
        while (i--) {
          const keyRoom = roomPool[i];
          if (!keyRoom) break;

          if (Math.random() < CHANCE_TO_ADD_KEY) {
            lockDoors.push(door);
            keyRooms.push(keyRoom);
            break;
          }
        }
      }
    }

    if (lockDoors.length !== keyRooms.length) {
      console.error('Mismatched keys and locks');
      return;
    }

    for (let i = 0; i < keyRooms.length; i++) {
      const doorId = lockDoors[i];
      const door = btl.doors[doorId];

      const roomId = keyRooms[i];
      const room = btl.rooms[roomId];
      while (true) {
        const x = room.left + RNG.getUniformInt(0, room.width - 1);
        const y = room.top + RNG.getUniformInt(0, room.height - 1);
        if (mapData.get(x, y)!.type === Type.Floor) {
          setDoorKey(x, y, door.x, door.y);
          break;
        }
      }
    }

    return;

    function setDoorKey(kx: number, ky: number, dx: number, dy: number) {
      const doorType = +RNG.getWeightedValue(
        doorWeights as { [key: number]: number }
      )!;
      if (!doorType) return;
      const keyType = DoorKeyPairs[doorType as keyof typeof DoorKeyPairs]!;
      if (!keyType) return;

      mapData.set(kx, ky, tiles.createEntityOfType(keyType));
      mapData.set(dx, dy, tiles.createEntityOfType(doorType));
    }

    function queueRooms(roomId: number) {
      const room = btl.rooms[roomId];
      room.neighbors.forEach((n) => {
        if (roomPool.includes(n)) return;
        roomPool.push(n);
        queueRooms(n);
      });
    }
  }
}

// ************************

function getType(x: Type | WeightedType): Type {
  if (typeof x === 'object') {
    return RNG.getWeightedValue(
      x as { [key: number]: number }
    ) as unknown as Type;
  }
  return x;
}

function isTilePassable(t: Type | null) {
  if (t === null) return true;
  return (
    t === Type.Floor ||
    t === Type.Stairs ||
    t === Type.Player ||
    t === Type.Key ||
    t === Type.Door ||
    t === Type.OSpell1 ||
    t === Type.OWall1 ||
    t === Type.OSpell2 ||
    t === Type.OWall2 ||
    t === Type.OSpell3 ||
    t === Type.OWall3
  );
}
