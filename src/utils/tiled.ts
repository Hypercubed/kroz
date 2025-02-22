import type * as tiled from '@kayahr/tiled';

export function addProperty(map: tiled.Map, value: tiled.AnyProperty) {
  map.properties ??= [];
  map.properties.push(value);
  return map;
}
