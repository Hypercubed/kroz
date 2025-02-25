import { clamp } from './utils';

export interface LinearParams {
  b0: number;
  m: number;
  max: number;
  min: number;
}

export function clampLinear({ b0, m, min, max }: LinearParams, x: number) {
  return clamp(b0 + x * m, min, max);
}
