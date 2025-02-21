import * as debug from '../data/debug/index.ts';
import * as forgotton from '../data/forgotten/index.ts';
import * as kingdom from '../data/kingdom/index.ts';
import * as lost from '../data/lost/index.ts';
import * as caverns from '../data/caverns/index.ts';
import * as cruz from '../data/cruz/index.ts';
import * as loading from '../data/loading/index.ts';

const k = kingdom.LEVELS.filter(Boolean).length;
const c = caverns.LEVELS.filter(Boolean).length;
const l = lost.LEVELS.filter(Boolean).length;
const z = cruz.LEVELS.filter(Boolean).length;

console.log(`Kingdom: ${k}, Caverns: ${c}, Lost: ${l}, Cruz: ${z}`);

interface Game {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  LEVELS: ((() => Promise<any>) | null)[];
  title: string;
  readTileset: () => Promise<unknown>;
  readColor: () => Promise<unknown>;
}

export const games = {
  loading,
  debug,
  forgotton,
  kingdom,
  lost,
  caverns,
  cruz
} satisfies Record<string, Game>;
