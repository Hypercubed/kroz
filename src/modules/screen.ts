import * as display from './display';
import * as state from './state';
import * as controls from './controls';

import {
  FLOOR_CHAR,
  HEIGHT,
  TITLE,
  XBot,
  XTop,
  YBot,
  YTop,
} from '../data/constants';
import { RNG } from 'rot-js';
import { Color } from '../data/colors';
import { delay } from '../utils/utils';
import dedent from 'ts-dedent';
import { Tile, TileChar, TileColor, TileMessage } from '../data/tiles';

export function renderScreen() {
  const x = 70;
  display.drawText(x, 0, 'Score', Color.Yellow, Color.Blue);
  display.drawText(x, 3, 'Level', Color.Yellow, Color.Blue);
  display.drawText(x, 6, 'Gems', Color.Yellow, Color.Blue);
  display.drawText(x, 9, 'Whips', Color.Yellow, Color.Blue);
  display.drawText(x - 2, 12, 'Teleports', Color.Yellow, Color.Blue);
  display.drawText(x, 15, 'Keys', Color.Yellow, Color.Blue);

  const [fg, bg] = display.getColors(Color.HighIntensityWhite, Color.Blue);
  display.drawText(69, 18, 'OPTIONS', fg, Color.Red);
  display.drawText(69, 19, `%c{${fg}}W%c{}hip`, Color.White, bg);
  display.drawText(69, 20, `%c{${fg}}T%c{}eleport`, Color.White, bg);
  display.drawText(69, 21, `%c{${fg}}P%c{}ause`, Color.White, bg);
  display.drawText(69, 22, `%c{${fg}}Q%c{}uit`, Color.White, bg);
  display.drawText(69, 23, `%c{${fg}}S%c{}ave`, Color.White, bg);
  display.drawText(69, 24, `%c{${fg}}R%c{}estore`, Color.White, bg);
}

// https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST1.LEV#L328
export function renderStats() {
  const whipStr =
    state.stats.whipPower > 2
      ? `${state.stats.whips}+${state.stats.whipPower - 2}`
      : state.stats.whips.toString();

  const width = 4;
  const size = 7;

  const gc =
    !state.game.paused && state.stats.gems < 10 ? Color.Red | 16 : Color.Red;

  const x = 69;

  display.drawText(
    x,
    1,
    pad((state.stats.score * 10).toString(), width + 1, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    4,
    pad(state.stats.levelIndex.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    7,
    pad(state.stats.gems.toString(), width + 1, size),
    gc,
    Color.Grey,
  );
  display.drawText(x, 10, pad(whipStr, width, size), Color.Red, Color.Grey);
  display.drawText(
    x,
    13,
    pad(state.stats.teleports.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    16,
    pad(state.stats.keys.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
}

export function renderBorder() {
  const char = TileChar[Tile.Border];
  const [fg, bg] = TileColor[Tile.Border];

  for (let x = XBot - 1; x <= XTop + 1; x++) {
    display.draw(x, 0, char, fg!, bg!);
    display.draw(x, YTop + 1, char, fg!, bg!);
  }
  for (let y = YBot - 1; y <= YTop + 1; y++) {
    display.draw(0, y, char, fg!, bg!);
    display.draw(XTop + 1, y, char, fg!, bg!);
  }
}

export async function introScreen() {
  display.clear(Color.Black);

  display.writeCenter(20, TITLE, Color.Yellow);

  display.writeCenter(
    21,
    'Original Level Design (C) 1990 Scott Miller',
    Color.Yellow,
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
  );

  return controls.repeatUntilKeyPressed(async () => {
    display.drawText(
      5,
      5,
      dedent`
      ███     ███     ██████████         ███████████        █████████████  (R)
      ███░░  ███░░░   ███░░░░░███░      ███░░░░░░░███░        ░░░░░░████░░░
      ███░░ ███░░░    ███░░   ███░░     ███░░     ███░░            ███░░░░
      ███░░███░░░     ███░░   ███░░    ███░░░      ███░           ███░░░
      ███░███░░░      ██████████░░░    ███░░       ███░░         ███░░░
      ██████░░░       ███░░███░░░░     ███░░       ███░░        ███░░░
      ███░███░        ███░░ ███░        ███░      ███░░░       ███░░░
      ███░░███░       ███░░  ███░       ███░░     ███░░      ████░░░
      ███░░ ███░      ███░░   ███░       ███████████░░░     █████████████
      ███░░  ███░       ░░░     ░░░        ░░░░░░░░░░░        ░░░░░░░░░░░░░
      ███░░   ███░
      ███░░    ███████████████████████████████████████████████████████████
      ░░░      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    `,
      RNG.getUniformInt(1, 15),
    );

    await delay(500);
  });
}

export async function instructionsScreen() {
  display.clear(Color.Black);

  display.writeCenter(0, TITLE, Color.Yellow, Color.Black);
  display.writeCenter(1, 'INSTRUCTIONS', Color.HighIntensityWhite, Color.Black);
  display.writeCenter(2, '------------', Color.HighIntensityWhite, Color.Black);

  display.drawText(
    0,
    5,
    dedent`
    The dungeons contain dozens of treasures,  spells,  traps and other mysteries.
  Touching an object for the first time will reveal a little of its identity,  but
  it will be left to you to decide how best to use it or avoid it.                
    When a creature touches you it will vanish,  taking with it a few of your gems
  that you have collected. If you have no gems then the creature will instead take
  your life!  Whips can be used to kill nearby creatures, but they are better used
  to smash through crumbled walls and forest terrain.`,
    Color.LightBlue,
    Color.Black,
  );

  display.drawText(
    3,
    13,
    dedent`
    You can use these        u i o    7 8 9
    cursor keys to            \\|/      \\|/     w or 5: Whip
    move your man,           j- -k    4- -6         T: Teleport
    and the four              /|\\      /|\\
    normal cursor keys       n m ,    1 2 3`,
    Color.LightBlue,
    Color.Black,
  );

  display.drawText(
    0,
    19,
    dedent`
    It's a good idea to save (S) your game at every new level,  therefore,  if you
    die you can easily restore (R) the game at that level and try again.`,
    Color.LightBlue,
    Color.Black,
  );

  display.writeCenter(
    22,
    'Have fun and good-luck...',
    Color.HighIntensityWhite,
    Color.Black,
  );
  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black,
  );

  await controls.waitForKeypress();
}

export async function openSourceScreen() {
  display.clear(Color.Black);

  display.writeCenter(1, TITLE, Color.Yellow);

  display.drawText(
    2,
    4,
    dedent`
    The original Kroz games were created by Scott Miller and published
    by Apogee Software. The original Kroz games were released in the
    late 1980s and early 1990s.`,
    Color.White,
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black,
  );
  await controls.waitForKeypress();
  controls.clearKeys();

  display.drawText(
    2,
    9,
    dedent`
    This game is a tribute to the original Kroz series of games and completly
    open-source.  If you enjoy this game you are asked by the author to 
    please add a star to the github repo at
    https://github.com/Hypercubed/kroz.`,
    Color.White,
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black,
  );
  await controls.waitForKeypress();
  controls.clearKeys();

  display.drawText(
    2,
    14,
    dedent`
    Better yet, contribute to the game yourself; or maybe fork it and add your
    own levels.  That might make a nice 7DRL challenge entry.`,
    Color.White,
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black,
  );
  await controls.waitForKeypress();
  controls.clearKeys();

  display.drawText(10, 18, 'Thank you and enjoy the game.  -- Hypercubed');
  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black,
  );
  await controls.waitForKeypress();
  controls.clearKeys();
}

function pad(s: string, n: number, r: number) {
  return s.padStart(n, FLOOR_CHAR).padEnd(r, FLOOR_CHAR);
}

export function renderPlayfield() {
  for (let x = 0; x < state.level.map.width; x++) {
    for (let y = 0; y < state.level.map.height; y++) {
      // Skip entities, will be rendered later
      const b = state.level.map.get(x, y);
      if (b === Tile.Player) continue;
      if (b === Tile.Slow || b === Tile.Medium || b === Tile.Fast) continue;

      drawTile(x, y, state.level.map.get(x, y));
    }
  }

  const floorColor = TileColor[Tile.Floor][1]!;

  for (let i = 0; i < state.level.entities.length; i++) {
    const e = state.level.entities[i];
    if (e.x === -1 || e.y === -1) continue; // dead
    drawTile(e.x, e.y, e.getChar(), TileColor[e.type][0]!, floorColor);
  }

  drawTile(
    state.level.player.x,
    state.level.player.y,
    state.level.player.getChar(),
    TileColor[state.level.player.type][0]!,
    floorColor,
  );
}

export function drawTile(
  x: number,
  y: number,
  block?: Tile | string,
  fg?: Color | string,
  bg?: Color | string,
) {
  block ??= state.level.map.get(x, y);

  let ch: string;

  if (isTile(block)) {
    ch = TileChar[block] ?? block ?? TileChar[Tile.Floor];
    fg ??=
      TileColor[block as unknown as Tile]?.[0] ?? TileColor[Tile.Floor][0]!;
    bg ??=
      TileColor[block as unknown as Tile]?.[1] ?? TileColor[Tile.Floor][1]!;
  } else if (
    (block >= 'a' && block <= 'z') ||
    ['!', '·', '∙', '∩'].includes(block)
  ) {
    ch = block.toUpperCase();
    fg = fg ?? Color.HighIntensityWhite;
    bg = bg ?? Color.Brown;
  } else {
    ch = block as string;
  }

  switch (block) {
    case Tile.Stairs:
      fg = typeof fg === 'number' && !state.game.paused ? fg | 16 : fg; // add blink
      break;
  }

  display.draw(x + XBot, y + YBot, ch, fg!, bg!);
}

export function drawOver(x: number, y: number, ch: string, fg: string | Color) {
  const block = state.level.map.get(x, y);

  let bg: number;
  if ((block >= 'a' && block <= 'z') || block === '!') {
    bg = Color.Brown;
  } else {
    bg = TileColor[block as unknown as Tile]?.[1] ?? TileColor[Tile.Floor][1]!;
  }

  display.drawOver(x + XBot, y + YBot, ch, fg, bg);
}

export async function flashTileMessage(msg: Tile, once: boolean = false) {
  if (once) {
    if (state.game.foundSet === true || state.game.foundSet.has(msg)) return '';
    state.game.foundSet.add(msg);
  }

  const str = TileMessage[msg];
  if (!str) return '';

  return await flashMessage(str);
}

export async function flashMessage(msg: string): Promise<string> {
  if (!msg) return '';

  const x = (XTop - msg.length) / 2;
  const y = YTop + 1;

  state.game.paused = true;

  const key = await controls.repeatUntilKeyPressed(() => {
    display.drawText(x, y, msg, RNG.getUniformInt(1, 15), Color.Black);
  });
  renderBorder();
  state.game.paused = false;
  return key;
}

export function fullRender() {
  display.clear(Color.Blue);
  renderBorder();
  renderScreen();
  renderPlayfield();
  renderStats();
}

export function fastRender() {
  renderPlayfield();
  renderStats();
}

function isTile(x: unknown): x is Tile {
  return typeof x === 'number';
}
