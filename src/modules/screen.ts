import * as display from './display';
import * as world from './world';
import * as controls from './controls';

import {
  FLOOR_CHAR,
  HEIGHT,
  TITLE,
  WIDTH,
  XBot,
  XTop,
  YBot,
  YTop,
} from '../data/constants';
import { default as RNG } from 'rot-js/lib/rng';
import { Color, ColorCodes } from '../data/colors';
import { delay } from '../utils/utils';
import dedent from 'ts-dedent';
import { Type, TypeChar, TypeColor, TypeMessage } from '../data/tiles';
import { Entity } from '../classes/entity';
import { isInvisible, Position, Renderable } from '../classes/components';

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
    world.stats.whipPower > 2
      ? `${world.stats.whips}+${world.stats.whipPower - 2}`
      : world.stats.whips.toString();

  const width = 4;
  const size = 7;

  const gc =
    !world.game.paused && world.stats.gems < 10 ? Color.Red | 16 : Color.Red;

  const x = 69;

  display.drawText(
    x,
    1,
    pad((world.stats.score * 10).toString(), width + 1, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    4,
    pad(world.stats.levelIndex.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    7,
    pad(world.stats.gems.toString(), width + 1, size),
    gc,
    Color.Grey,
  );
  display.drawText(x, 10, pad(whipStr, width, size), Color.Red, Color.Grey);
  display.drawText(
    x,
    13,
    pad(world.stats.teleports.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    16,
    pad(world.stats.keys.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
}

export function renderBorder() {
  const char = TypeChar[Type.Border];
  const [fg, bg] = TypeColor[Type.Border];

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
    Kroz is a series of Roguelike video games created by Scott Miller and 
    published by Apogee Software in the late 1980s and early 1990s.  In March
    2009, the whole Kroz series was released as freeware by Apogee, and the
    source code was released as free software under the GPL license.`,
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
    This is a re-implementation the original Kroz series of games in typescript 
    playable in the browser.  The source code completly open-source.  If you
    enjoy this game you are asked by the author to please add a star to the
    github repo at https://github.com/Hypercubed/kroz.`,
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
    15,
    dedent`
    Better yet, contribute to the game yourself; or maybe fork it and add your
    own levels.  That might make a nice 7DRL challenge entry
    (https://7drl.com/).`,
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

  display.drawText(10, 20, 'Thank you and enjoy the game.  -- Hypercubed');
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
  for (let x = 0; x < world.level.map.width; x++) {
    for (let y = 0; y < world.level.map.height; y++) {
      // Skip entities, will be rendered later
      const e = world.level.map.get(x, y);

      if (!e) {
        drawFloorAt(x, y);
        continue;
      }

      if (
        e.type === Type.Player ||
        e.type === Type.Slow ||
        e.type === Type.Medium ||
        e.type === Type.Fast
      )
        continue;

      drawEntity(x, y, e);
    }
  }

  for (let i = 0; i < world.level.entities.length; i++) {
    const e = world.level.entities[i];
    const p = e.get(Position)!;
    if (p.x === -1 || p.y === -1) continue; // dead
    drawEntity(p.x, p.y, e);
  }

  const p = world.level.player.get(Position)!;
  drawEntity(p.x, p.y, world.level.player);
}

function drawFloorAt(x: number, y: number) {
  const [fg, bg] = TypeColor[Type.Floor];
  display.draw(x + XBot, y + XBot, FLOOR_CHAR, fg!, bg!);
}

export function drawEntity(x: number, y: number, entity?: Entity | null) {
  drawFloorAt(x, y);

  entity ??= world.level.map.get(x, y);
  if (!entity) return;
  if (entity.has(isInvisible)) return;
  if (!entity.has(Renderable)) return;

  const t = entity.get(Renderable)!;
  display.draw(x + XBot, y + YBot, t.ch, t.fg!, t.bg!);
}

export function drawType(
  x: number,
  y: number,
  block?: Type | string,
  fg?: Color | string,
  bg?: Color | string,
) {
  block ??= world.level.map.getType(x, y);

  let ch: string;

  if (isType(block)) {
    ch = TypeChar[block] ?? block ?? TypeChar[Type.Floor];
    fg ??=
      TypeColor[block as unknown as Type]?.[0] ?? TypeColor[Type.Floor][0]!;
    bg ??=
      TypeColor[block as unknown as Type]?.[1] ?? TypeColor[Type.Floor][1]!;
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
    case Type.Stairs:
      fg = typeof fg === 'number' && !world.game.paused ? fg | 16 : fg; // add blink
      break;
  }

  display.draw(x + XBot, y + YBot, ch, fg!, bg!);
}

export function drawOver(x: number, y: number, ch: string, fg: string | Color) {
  const block = world.level.map.getType(x, y);

  let bg: number;
  if ((block >= 'a' && block <= 'z') || block === '!') {
    bg = Color.Brown;
  } else {
    bg = TypeColor[block as unknown as Type]?.[1] ?? TypeColor[Type.Floor][1]!;
  }

  display.drawOver(x + XBot, y + YBot, ch, fg, bg);
}

export async function flashTypeMessage(msg: Type, once: boolean = false) {
  if (once) {
    if (world.game.foundSet === true || world.game.foundSet.has(msg)) return '';
    world.game.foundSet.add(msg);
  }

  const str = TypeMessage[msg];
  if (!str) return '';

  return await flashMessage(str);
}

export async function flashMessage(msg: string): Promise<string> {
  if (!msg) return '';

  const x = (XTop - msg.length) / 2;
  const y = YTop + 1;

  world.game.paused = true;

  const key = await controls.repeatUntilKeyPressed(() => {
    display.drawText(x, y, msg, RNG.getUniformInt(1, 15), Color.Black);
  });
  renderBorder();
  world.game.paused = false;
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

function isType(x: unknown): x is Type {
  return typeof x === 'number';
}

export async function renderTitle() {
  display.clear(Color.Blue);

  display.drawText(
    2,
    5,
    dedent`
    In the mystical Kingdom of Kroz, where ASCII characters come to life and
    danger lurks around every corner, a new chapter unfolds. You, a brave
    archaeologist, have heard whispers of the legendary Magical Amulet of Kroz,
    an artifact of immense power long thought lost to time.

    Will you be the one to uncover the secrets of the forsaken caverns? Can you
    retrieve the Magical Amulet and restore glory to the Kingdom of Kroz? The
    adventure awaits, brave explorer!

  `,
    Color.LightCyan,
    Color.Blue,
  );

  display.drawText(
    9,
    16,
    `Use the cursor keys to move yourself (%c{${ColorCodes[Color.Yellow]}}☻%c{${ColorCodes[Color.LightGreen]}}) through the caverns.`,
    Color.LightGreen,
    Color.Blue,
  );

  display.writeCenter(
    17,
    `Use your whip (press W) to destroy all nearby creatures.`,
    Color.LightGreen,
    Color.Blue,
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to begin your decent into Kroz.',
    Color.HighIntensityWhite,
    Color.Blue,
  );

  const x = WIDTH / 2 - TITLE.length / 2;

  await controls.repeatUntilKeyPressed(async () => {
    display.drawText(x, 3, TITLE, RNG.getUniformInt(0, 16), Color.Red);
    await delay(500);
  });
}
