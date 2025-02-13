import * as debug from '../data/debug/index.ts';
import * as forgotton from '../data/forgotton/index.ts';
import * as kingdom from '../data/kingdom/index.ts';
import * as lost from '../data/lost/index.ts';
import * as caverns from '../data/caverns/index.ts';
import * as cruz from '../data/cruz/index.ts';

interface Game {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  LEVELS: ((() => Promise<any>) | null)[];
  title: string;
  readTileset: () => Promise<unknown>;
  readColor: () => Promise<unknown>;
}

export const games = {
  debug,
  forgotton,
  kingdom,
  lost,
  caverns,
  cruz
} satisfies Record<string, Game>;
