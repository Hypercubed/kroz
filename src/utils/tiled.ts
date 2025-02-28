import * as tiled from '@kayahr/tiled';

import * as tiles from '../modules/tiles';

import { type Level } from '../modules/levels';
import { Entity } from '../classes/entity';
import { ensureObject, wrapString } from './utils';
import { Type } from '../constants/types';
import { Color } from '../modules/colors';
import { Renderable } from '../classes/components';

/** Adds a property to a tiled map */
export function addProperty(map: tiled.Map, value: tiled.AnyProperty) {
  map.properties ??= [];
  map.properties.push(value);
  return map;
}

export function getTileIdFromGID(gid: number): number {
  if (!gid || gid < 0) return -1;
  return (+gid % 256) - 1;
}

// Reads the level data from a Tiled JSON file into a Level object
export function readLevelJSONLevel(tilemap: tiled.Map): Level {
  const { properties: _properties } = tilemap;
  const output: Entity[] = readTileMapLayers(tilemap);
  const properties = ensureObject(_properties);

  const startTrigger =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tilemap.StartTrigger ?? properties?.StartTrigger ?? undefined;

  return {
    id: (properties?.id || '') as string,
    data: output,
    startTrigger,
    properties
  };
}

export function readTileMapLayers(tilemap: tiled.Map): Entity[] {
  const output: Entity[] = [];

  for (const layer of tilemap.layers) {
    // Collapse layers
    // TODO: Combine layers?
    if (tiled.isEncodedTileLayer(layer)) {
      readUnencodedTileLayer(tiled.decodeTileLayer(layer));
    } else if (tiled.isUnencodedTileLayer(layer)) {
      readUnencodedTileLayer(layer);
    } else if (tiled.isObjectGroup(layer)) {
      readObjectGroup(layer);
    } else {
      throw new Error('Unsupported layer encoding');
    }
  }

  return output;

  function readObjectGroup(layer: tiled.ObjectGroup) {
    for (const obj of layer.objects) {
      if (obj.text) {
        readTextObject(obj);
        continue;
      }

      const { gid, x, y, height, width, properties, type } = obj;
      if (!gid || x < 0 || y < 0 || !height || !width) continue;
      if (gid > 0) {
        const tileId = getTileIdFromGID(obj.gid!);
        const xx = x / width;
        const yy = y / height - 1;
        output[yy * tilemap.width + xx] = tiles.createEntityFromTileId(
          tileId,
          xx,
          yy,
          ensureObject(properties),
          type
        );
      }
    }

    return output;
  }

  function readTextObject(obj: tiled.MapObject) {
    const { x, y, height, width, properties, text } = obj;
    if (!x || !y || !height || !width) return;
    const tileId = 97; // Solid Wall
    const type = Type.Wall;

    const str = text!.text!;
    const wrap = text!.wrap;

    const px = x / 24;
    const py = y / 36;
    const w = width / 24;

    let lines = [str];
    if (wrap) {
      lines = wrapString(str, w).split('\n');
    }

    const { halign, color } = obj.text!;

    const props = ensureObject(properties || {});
    const fg = props.fgColor ?? color ?? Color.HighIntensityWhite;
    const bg = props.bgColor ?? Color.Brown;

    for (let y = 0; y < lines.length; y++) {
      let line = lines[y];
      if (halign === 'right') {
        line = line.padStart(w, ' ');
      }
      for (let x = 0; x < line.length; x++) {
        const xx = px + x;
        const yy = py + y;

        const e = tiles.createEntityFromTileId(
          tileId,
          xx,
          yy,
          ensureObject(properties),
          type
        );
        e.get(Renderable)!.ch = line[x];
        e.get(Renderable)!.fg = fg;
        e.get(Renderable)!.bg = bg;

        output[yy * tilemap.width + xx] = e;
      }
    }
  }

  function readUnencodedTileLayer(layer: tiled.UnencodedTileLayer) {
    const { data } = layer;
    if (!data) return output;

    for (let i = 0; i < data.length; i++) {
      const tileId = getTileIdFromGID(+data[i]);
      if (tileId > -1) {
        const x = i % tilemap.width;
        const y = Math.floor(i / tilemap.width);
        output[i] = tiles.createEntityFromTileId(tileId, x, y);
      }
    }
    return output;
  }
}
