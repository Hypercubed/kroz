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

export enum LayerType {
  Fill,
  Prefab,
  CA,
  Generator,
  Brogue,
  BSP
}

type WeightedType = { [key in Type]?: number };
type OptionValue<T> = T | ((meta: Meta) => T);

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
  tileType: Type | WeightedType;
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
  connect?: number;
}

export interface GeneratorLayer {
  type: LayerType.Generator;
  generator: (map: Matrix<Entity>, x: number, y: number, meta: Meta) => void;
  count: OptionValue<number>;
}

export const enum RogueMapType {
  Void,
  Floor,
  Wall,
  Door,
  SpecialDoor,
  Enter,
  Exit,
  Key
}

export interface BrogueLayer {
  type: LayerType.Brogue;
  keys?: OptionValue<number | undefined>;
  special?: OptionValue<boolean>;
  width?: number;
  height?: number;
  max_width?: OptionValue<number>;
  max_height?: OptionValue<number>;
  min_width?: OptionValue<number>;
  min_height?: OptionValue<number>;
  ideal?: OptionValue<number>;
  tileTypes?: { [key in RogueMapType]?: Type | WeightedType };
  doorTypes?: Type | WeightedType;
}

export interface BSPLayer {
  type: LayerType.BSP;
  keys?: OptionValue<number | undefined>;
  width?: number;
  height?: number;
  max_width?: OptionValue<number>;
  max_height?: OptionValue<number>;
  min_width?: OptionValue<number>;
  min_height?: OptionValue<number>;
  doorTypes?: Type | WeightedType;
  tileTypes?: { [key in RogueMapType]?: Type | WeightedType };
}

export type Layer =
  | FillLayer
  | PrefabLayer
  | CALayer
  | GeneratorLayer
  | BrogueLayer
  | BSPLayer;

export interface LevelDefinition {
  layers: Layer[];
  properties?: Record<string, unknown>;
}

type Meta = Record<string, unknown> & { depth: number };

// **********************

export async function generateMap(level: LevelDefinition, depth: number) {
  const mapData = new PlayField();
  const meta: Meta = { depth };

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
      case LayerType.BSP:
        addBSPLayer(layer, mapData, meta);
        break;
    }
  }

  return { mapData, meta };
}

// ************ Fill Layer ************

function addFillLayer(layerData: FillLayer, mapData: PlayField) {
  const x0 = layerData.x ?? 0;
  const y0 = layerData.y ?? 0;
  const x1 = x0 + (layerData.width ?? mapData.width);
  const y1 = y0 + (layerData.height ?? mapData.height);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const t = getType(layerData.tiles);
      mapData.set(x, y, tiles.createEntityOfType(t, x, y));
    }
  }
}

// ************ Prefab Layer ************

async function addPrefabLayer(layerData: PrefabLayer, mapData: PlayField) {
  const tilemap = await layerData.readMap();
  const data = readTileMapLayers(tilemap);

  const m = new Matrix<Entity>(mapData.width, mapData.height);
  m.fromArray(data);

  m.forEach((e, x, y) => {
    if (e) mapData.set(x, y, e);
  });
}

// ************ Cellular Automata Layer ************

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

  let passableMap = mapData.map<number>((e) =>
    isTilePassable(e?.type ?? null) ? 0 : 1
  );

  // console.log('Passable Map');
  // console.log(passableMap.toMapString());

  while (max-- > 0) {
    while (retry-- > 0) {
      const caMap = buildMap();
      const map = Matrix.fromArraysTransposed(caMap._map);
      // console.log('CA Map');
      // console.log(map.toMapString());

      const p = findPostion(map);

      if (!p) continue;

      mapData.place(map, ...p, (e, x, y) => {
        if (!e) return null;
        const type = getType(layerData.tileType);
        return tiles.createEntityOfType(type, x, y);
      });

      passableMap = mapData.map<number>((e) =>
        isTilePassable(e?.type ?? null) ? 0 : 1
      );
      // console.log('Map Built');

      break;
    }
  }

  function findPostion(map: Matrix<number>): [number, number] | false {
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
    if (layerData.connect) map.connect(() => {}, layerData.connect);
    return map;
  }

  function checkPaths(map: Matrix<number>, x0: number, y0: number) {
    // Check allowed placement
    if (allowedPlacement && allowedPlacement.length) {
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const p = map.get(x, y);
          if (!p) continue;
          const [xx, yy] = [x + x0, y + y0];

          const e = mapData.get(xx, yy);
          if (!e) continue;

          if (!allowedPlacement.includes(e.type)) {
            return false;
          }
        }
      }
    }

    if (layerData.checkPath) {
      const m = passableMap.clone();
      m.place(map, x0, y0, (e) => (!e ? null : 2 * e));
      // console.log('With Lake');
      // console.log(m.toMapString());

      floodFill(m);
      // console.log('After Fill');
      // console.log(m.toMapString());

      // Check if there are any 0s left
      if (m.some(0)) return false;
    }

    return true;
  }

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

    m.floodFill(startX, startY, 1);
  }
}

// ************ Random Placement Layer ************

function addGeneratorLayer(
  layerData: GeneratorLayer,
  mapData: Matrix<Entity>,
  meta: Meta
) {
  let n = ~~(getValue(layerData.count, meta) ?? 1);

  if (n < 1) return;
  while (n--) {
    const p = mapData.getRandom((e) => e.type === Type.Floor);
    if (!p) break;
    layerData.generator(mapData, p[0], p[1], meta);
  }
}

// ************ Brogue-like map generation ************

const DoorKeyPairs = {
  [Type.Door]: Type.Key,
  [Type.OWall1]: Type.OSpell1,
  [Type.OWall2]: Type.OSpell2,
  [Type.OWall3]: Type.OSpell3
};

const DefaultDoorWeights = {
  [Type.Door]: 70,
  [Type.OWall1]: 15,
  [Type.OWall2]: 10
  // [Type.OWall3]: 5
};

const DefaultTileTypes = {
  [RogueMapType.Void]: Type.Stop,
  [RogueMapType.Floor]: Type.Floor,
  [RogueMapType.Wall]: Type.Wall,
  [RogueMapType.Door]: Type.Floor, // Doors are added later
  [RogueMapType.SpecialDoor]: Type.Door,
  [RogueMapType.Enter]: Type.Player,
  [RogueMapType.Exit]: Type.Stairs
};

function addBrogueLayer(
  layerData: BrogueLayer,
  mapData: Matrix<Entity>,
  meta: Meta
) {
  const width = layerData.width ?? mapData.width;
  const height = layerData.height ?? mapData.height;
  let max_width = getValue(layerData.max_width, meta) ?? 25;
  let max_height = getValue(layerData.max_height, meta) ?? 25;
  const min_width = getValue(layerData.min_width, meta) ?? 2;
  const min_height = getValue(layerData.min_height, meta) ?? 2;
  let ideal = getValue(layerData.ideal, meta) ?? 70;

  const tileTypes = { ...DefaultTileTypes, ...(layerData.tileTypes || {}) } as {
    [key in RogueMapType]: Type;
  };

  const btl = buildMap();

  mapData.fill((x, y) => {
    const t = btl.world[y][x] as RogueMapType;
    const type = getType(tileTypes[t]);
    return tiles.createEntityOfType(type, x, y);
  });

  Object.assign(meta, btl);

  addKeys(layerData, mapData, Object.assign(meta, btl));

  function buildMap(): RogueMap {
    let btl: RogueMap | null = null;
    const special = getValue(layerData.special, meta) ?? false;

    while (!btl) {
      try {
        const rogue = new Rogue({
          width,
          height,
          retry: 100,
          special,
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
}

function addKeys(
  layerData: BrogueLayer | BSPLayer,
  mapData: Matrix<Entity>,
  meta: Meta & RogueMap
) {
  let keys =
    getValue(layerData.keys, meta) ?? RNG.getUniformInt(0, meta.room_count);

  keys = Math.min(keys, meta.room_count);

  const doorWeights = layerData.doorTypes ?? DefaultDoorWeights;

  // List of rooms ordered by proximity to the entrance
  const roomList: number[] = [];
  queueRooms(meta.enter!.room_id);

  const lockDoors: number[] = [];

  let retries = 100; // Shouldn't need thos

  while (retries-- > 0 && keys > 0) {
    const roomToLock = RNG.getItem(roomList); // Pick a random room to add a locked door
    if (roomToLock === null) break;

    const index = roomList.indexOf(roomToLock);
    if (index === -1) continue;

    const previousRooms = roomList.slice(0, index); // List of rooms before the current room
    const roomToAddKey = RNG.getItem(previousRooms); // Pick a random room to add a key
    if (roomToAddKey == null) continue;

    const doorToLock = RNG.getItem(meta.rooms[roomToLock].doors);
    if (doorToLock === null) continue;
    if (lockDoors.includes(doorToLock)) continue; // Already has a lock

    setDoorAndKey(doorToLock, roomToAddKey);
    keys--;
  }

  function setDoorAndKey(doorId: number, roomId: number) {
    const door = meta.doors[doorId];
    const room = meta.rooms[roomId];

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
    const doorType = getType(doorWeights);
    if (!doorType) return;
    const keyType = DoorKeyPairs[doorType as keyof typeof DoorKeyPairs]!;
    if (!keyType) return;

    mapData.set(kx, ky, tiles.createEntityOfType(keyType));
    mapData.set(dx, dy, tiles.createEntityOfType(doorType));
  }

  function queueRooms(roomId: number) {
    roomList.push(roomId);
    const room = meta.rooms[roomId];
    room.neighbors.forEach((n) => {
      if (roomList.includes(n)) return;
      queueRooms(n);
    });
  }
}

// ************ BSP Layer ************

function addBSPLayer(
  layerData: BSPLayer,
  mapData: Matrix<Entity>,
  meta: Meta & RogueMap
) {
  const min_height = getValue(layerData.min_height, meta) ?? 6;
  const min_width = getValue(layerData.min_width, meta) ?? 12;
  const max_height = getValue(layerData.max_height, meta) ?? 20;
  const max_width = getValue(layerData.max_width, meta) ?? 40;

  const tileTypes = { ...DefaultTileTypes, ...(layerData.tileTypes || {}) } as {
    [key in RogueMapType]: Type;
  };

  console.log('BSP Layer');
  const bspMap = new Matrix<RogueMapType>(mapData.width, mapData.height);
  bspMap.fill(RogueMapType.Floor);

  const rooms: RogueRoom[] = [];
  const doors: RogueDoor[] = [];

  sliceMap(0, 0, mapData.width - 1, mapData.height - 1);

  meta.room_count = rooms.length;
  meta.rooms = rooms;
  meta.doors = doors;

  const enter = rooms[0];
  const exit = rooms[rooms.length - 1];

  meta.enter = {
    room_id: enter.id,
    x: RNG.getUniformInt(enter.left, enter.left + enter.width - 1),
    y: RNG.getUniformInt(enter.top, enter.top + enter.height - 1)
  };
  meta.exit = {
    room_id: exit.id,
    x: RNG.getUniformInt(exit.left, exit.left + exit.width - 1),
    y: RNG.getUniformInt(exit.top, exit.top + exit.height - 1)
  };

  bspMap.set(meta.enter.x, meta.enter.y, RogueMapType.Enter);
  bspMap.set(meta.exit.x, meta.exit.y, RogueMapType.Exit);

  mapData.fill((x, y) => {
    const t = bspMap.get(x, y);
    const type = getType(tileTypes[t!]);
    return tiles.createEntityOfType(type, x, y);
  });

  addKeys(layerData, mapData, meta as Meta & RogueMap);

  // rooms.forEach((room) => {
  //   const b = tiles.createEntityOfType(Type.Trap);
  //   mapData.fillRegion(b, room.left, room.top, room.left + room.width - 1, room.top + room.height - 1);
  // });

  function sliceMap(x0: number, y0: number, x1: number, y1: number) {
    const directions = [];
    if (x1 - x0 > min_width * 2 && (x1 - x0 > max_width || Math.random() < 0.5))
      directions.push('x');
    if (
      y1 - y0 > min_height * 2 &&
      (y1 - y0 > max_height || Math.random() < 0.5)
    )
      directions.push('y');
    if (directions.length === 0) {
      rooms.push({
        id: rooms.length,
        doors: [],
        neighbors: [],
        left: x0,
        top: y0,
        width: x1 - x0 + 1,
        height: y1 - y0 + 1
      });
      return;
    }

    let door: RogueDoor;
    let roomA: RogueRoom;
    let roomB: RogueRoom;

    if (RNG.getItem(directions) === 'x') {
      const x = RNG.getUniformInt(x0 + min_width, x1 - min_width);
      bspMap.fillRegion(RogueMapType.Wall, x, y0, x, y1);

      sliceMap(x0, y0, x - 1, y1);
      sliceMap(x + 1, y0, x1, y1);

      const dy = RNG.getUniformInt(y0, y1);
      door = { id: doors.length, x, y: dy };

      roomA = findContainer(x - 2, dy)!;
      roomB = findContainer(x + 2, dy)!;

      if (!roomA || !roomB) {
        console.log('Room A or Room B is null');
        console.log('x', x0, x1, y0, y1, x, dy);
        console.log(rooms);
      }
    } else {
      const y = RNG.getUniformInt(y0 + min_height, y1 - min_height);
      bspMap.fillRegion(RogueMapType.Wall, x0, y, x1, y);

      sliceMap(x0, y0, x1, y - 1);
      sliceMap(x0, y + 1, x1, y1);

      const dx = RNG.getUniformInt(x0, x1);
      door = { id: doors.length, x: dx, y };

      roomA = findContainer(dx, y - 2)!;
      roomB = findContainer(dx, y + 2)!;

      if (!roomA || !roomB) {
        console.log('Room A or Room B is null');
        console.log('y', x0, x1, y0, y1, dx, y);
        console.log(rooms);
      }
    }

    doors.push(door);
    roomA.doors.push(door.id);
    roomB.doors.push(door.id);
    roomA.neighbors.push(roomB.id);
    roomB.neighbors.push(roomA.id);

    bspMap.set(door.x, door.y, RogueMapType.Door); // Later replaced with a door or floor
  }

  function findContainer(x: number, y: number) {
    for (const room of rooms) {
      if (
        x >= room.left &&
        x <= room.left + room.width &&
        y >= room.top &&
        y <= room.top + room.height
      ) {
        return room;
      }
    }
    return null;
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

function getValue<T>(v: OptionValue<T>, meta: Meta): T {
  return typeof v === 'function' ? (v as (meta: Meta) => T)(meta) : v;
}
