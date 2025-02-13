import * as display from './display';
import * as world from './world';
import * as controls from './controls';
import * as sound from './sound';
import * as tiles from './tiles';
import * as colors from './colors';

import * as gameForgotton from '../data/forgotton/index.ts';
import * as gameKingdom from '../data/kingdom/index.ts';
import * as gameLost from '../data/lost/index.ts';
import * as gameCaverns from '../data/caverns/index.ts';
import * as gameCruz from '../data/cruz/index.ts';

import {
  DEBUG,
  ENABLE_BOTS,
  FLOOR_CHAR,
  HEIGHT,
  WIDTH,
  XBot,
  XTop,
  YBot,
  YTop
} from '../data/constants';
import { default as RNG } from 'rot-js/lib/rng';
import { Color, ColorCodes } from './colors';
import { delay, pad } from '../utils/utils';
import dedent from 'ts-dedent';
import { Type } from './tiles';
import { Entity } from '../classes/entity';
import {
  isSecreted,
  isInvisible,
  Position,
  Renderable,
  Glitch
} from '../classes/components';
import { Difficulty } from './world';

export function renderScreen() {
  const x = 70;
  display.drawText(x, 0, 'Score', Color.Yellow, Color.Blue);
  display.drawText(x, 3, 'Level', Color.Yellow, Color.Blue);
  display.drawText(x, 6, 'Gems', Color.Yellow, Color.Blue);
  display.drawText(x, 9, 'Whips', Color.Yellow, Color.Blue);
  display.drawText(x - 2, 12, 'Teleports', Color.Yellow, Color.Blue);
  display.drawText(x, 15, 'Keys', Color.Yellow, Color.Blue);

  const [fg, bg] = colors.getColors(Color.HighIntensityWhite, Color.Blue);
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
    pad(
      (world.stats.score * 10).toString(),
      width + 1,
      size,
      tiles.common.FLOOR_CHAR
    ),
    Color.Red,
    Color.Grey
  );
  display.drawText(
    x,
    4,
    pad(world.stats.levelIndex.toString(), width, size, FLOOR_CHAR),
    Color.Red,
    Color.Grey
  );
  display.drawText(
    x,
    7,
    pad(world.stats.gems.toString(), width + 1, size, FLOOR_CHAR),
    gc,
    Color.Grey
  );
  display.drawText(
    x,
    10,
    pad(whipStr, width, size, FLOOR_CHAR),
    Color.Red,
    Color.Grey
  );
  display.drawText(
    x,
    13,
    pad(world.stats.teleports.toString(), width, size, FLOOR_CHAR),
    Color.Red,
    Color.Grey
  );
  display.drawText(
    x,
    16,
    pad(world.stats.keys.toString(), width, size, FLOOR_CHAR),
    Color.Red,
    Color.Grey
  );
}

export function renderBorder() {
  const char = tiles.common.BORDER_CHAR;
  const fg = world.level.borderFG;
  const bg = world.level.borderBG;

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

  display.writeCenter(
    HEIGHT - 1,
    'Choose a game to start',
    Color.HighIntensityWhite
  );

  const k = gameKingdom.LEVELS.filter(Boolean).length;
  const c = gameCaverns.LEVELS.filter(Boolean).length;
  const l = gameLost.LEVELS.filter(Boolean).length;
  const z = gameCruz.LEVELS.filter(Boolean).length;

  display.drawText(
    4,
    17,
    dedent`

    1) ${k} levels from Kingdom of Kroz II (C) Scott Miller - 1987
    2) ${c} levels from Caverns of Kroz II (C) Scott Miller - 1989
    3) ${l} levels from Lost Adventures of Kroz (C) Scott Miller - 1990
    4) ${z} levels from The Underground Empire of Cruz (C) C. Allen - 2011

  `,
    Color.White,
    Color.Black
  );

  display.writeCenter(HEIGHT - 1, 'Choose a game to start', Color.White);

  let game = '-1';
  while (game < '0' || game > '4') {
    game = await controls.repeatUntilKeyPressed(async () => {
      display.drawText(
        5,
        3,
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
        RNG.getUniformInt(1, 15)
      );

      await delay(500);
    });
  }

  switch (game) {
    case '1':
      return gameKingdom;
    case '2':
      return gameCaverns;
    case '3':
      return gameLost;
    case '4':
      return gameCruz;
    default:
      return gameForgotton;
  }
}

export async function instructionsScreen() {
  display.clear(Color.Black);

  display.writeCenter(0, world.game.title, Color.Yellow, Color.Black);
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
    Color.Black
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
    Color.Black
  );

  display.drawText(
    0,
    19,
    dedent`
    It's a good idea to save (S) your game at every new level,  therefore,  if you
    die you can easily restore (R) the game at that level and try again.`,
    Color.LightBlue,
    Color.Black
  );

  display.writeCenter(
    22,
    'Have fun and good-luck...',
    Color.HighIntensityWhite,
    Color.Black
  );
  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black
  );

  await controls.waitForKeypress();
}

export async function openSourceScreen() {
  if (world.game.bot) return;

  display.clear(Color.Black);

  display.writeCenter(1, world.game.title, Color.Yellow);

  display.drawText(
    2,
    4,
    dedent`
    Kroz is a series of Roguelike video games created by Scott Miller and 
    published by Apogee Software in the late 1980s and early 1990s.  In March
    2009, the whole Kroz series was released as freeware by Apogee, and the
    source code was released as free software under the GPL license.`,
    Color.White
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black
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
    Color.White
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black
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
    Color.White
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black
  );
  await controls.waitForKeypress();
  controls.clearKeys();

  display.drawText(10, 20, 'Thank you and enjoy the game.  -- Hypercubed');
  display.writeCenter(
    HEIGHT - 1,
    'Press any key to continue.',
    Color.HighIntensityWhite,
    Color.Black
  );
  await controls.waitForKeypress();
  controls.clearKeys();
}

export function renderPlayfield() {
  for (let x = 0; x < world.level.map.width; x++) {
    for (let y = 0; y < world.level.map.height; y++) {
      // Skip entities, will be rendered later
      const e = world.level.map.get(x, y);

      if (
        !e ||
        e.type === Type.Player ||
        e.type === Type.Slow ||
        e.type === Type.Medium ||
        e.type === Type.Fast
      ) {
        drawFloorAt(x, y);
        continue;
      }

      drawEntityAt(x, y, e);
    }
  }

  for (let i = 0; i < world.level.entities.length; i++) {
    const e = world.level.entities[i];
    const p = e.get(Position)!;
    if (p.x === -1 || p.y === -1) continue; // dead
    drawEntityAt(p.x, p.y, e);
  }

  const p = world.level.player.get(Position)!;
  if (p) drawEntityAt(p.x, p.y, world.level.player);
}

export function clearPlayfield() {
  for (let x = 0; x < world.level.map.width; x++) {
    for (let y = 0; y < world.level.map.height; y++) {
      drawFloorAt(x, y);
    }
  }
}

function drawFloorAt(x: number, y: number) {
  display.draw(
    x + XBot,
    y + YBot,
    tiles.common.FLOOR_CHAR,
    tiles.common.FLOOR_FG,
    tiles.common.FLOOR_BG
  );
}

export function drawEntityAt(x: number, y: number, entity?: Entity | null) {
  drawFloorAt(x, y);

  entity ??= world.level.map.get(x, y);
  if (!entity) return;
  if (entity.has(isInvisible)) return;

  if (entity.has(isSecreted)) {
    display.draw(
      x + XBot,
      y + YBot,
      tiles.common.CHANCE_CHAR,
      tiles.common.CHANCE_FG,
      tiles.common.CHANCE_BG
    ); // Read from tileset data
    return;
  }

  if (!entity.has(Renderable)) return;

  const t = entity.get(Renderable)!;
  let ch = t.ch;
  const fg = t.fg;
  // if (!world.game.paused && fg !== null && t.blink) fg |= 16; // add blink

  if (entity.has(Glitch)) {
    ch = entity.get(Glitch)!.getFrame();
  }

  display.draw(x + XBot, y + YBot, ch, fg!, t.bg!);
}

export function drawAt(
  x: number,
  y: number,
  ch: string,
  fg: Color | string,
  bg: Color | string
) {
  display.draw(x + XBot, y + YBot, ch, fg, bg);
}

export function drawOver(
  x: number,
  y: number,
  ch: string,
  fg: string | Color,
  bg: string | Color = '#00000000'
) {
  display.drawOver(x + XBot, y + YBot, ch, fg, bg);
}

export async function flashMessage(msg: string): Promise<string> {
  if (world.game.bot) return '';
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
    Color.Blue
  );

  display.drawText(
    9,
    16,
    `Use the cursor keys to move yourself (%c{${ColorCodes[Color.Yellow]}}☻%c{${ColorCodes[Color.LightGreen]}}) through the caverns.`,
    Color.LightGreen,
    Color.Blue
  );

  display.writeCenter(
    17,
    `Use your whip (press W) to destroy all nearby creatures.`,
    Color.LightGreen,
    Color.Blue
  );

  await sound.play(220, 100, 50);
  await getDifficulty();
  await sound.play(700, 100, 10);

  display.writeCenter(
    HEIGHT - 1,
    'Press any key.',
    Color.HighIntensityWhite,
    Color.Blue
  );

  await controls.repeatUntilKeyPressed(async () => {
    await writeTitle();
  });
}

async function writeTitle() {
  const title = world.game.title;
  const x = WIDTH / 2 - title.length / 2;
  display.drawText(
    x,
    1,
    ' '.repeat(title.length + 2),
    RNG.getUniformInt(0, 16),
    Color.Red
  );
  display.drawText(
    x,
    2,
    ' ' + title + ' ',
    RNG.getUniformInt(0, 16),
    Color.Red
  );
  display.drawText(
    x,
    3,
    ' '.repeat(title.length + 2),
    RNG.getUniformInt(0, 16),
    Color.Red
  );
  await delay(500);
}

const DIFFICULTY_LEVELS = {
  '!': 'SECRET MODE',
  T: DEBUG ? 'TOURIST' : null,
  N: 'NOVICE',
  E: 'EXPERENCED',
  A: 'ADVANCED',
  B: DEBUG ? 'BOT' : null
};

async function getDifficulty() {
  let answer = '';

  const c1 = ColorCodes[Color.LightGreen];
  const c2 = ColorCodes[Color.HighIntensityWhite];
  display.drawText(
    (WIDTH - 52) / 2,
    19,
    `Are you a %c{${c2}}N%c{${c1}}ovice, %c{${c2}}E%c{${c1}}xperenced or and %c{${c2}}A%c{${c1}}dvanced player?`,
    c1,
    Color.Blue
  );

  while (!DIFFICULTY_LEVELS[answer as keyof typeof DIFFICULTY_LEVELS]) {
    answer = await controls.repeatUntilKeyPressed(async () => {
      await writeTitle();
    });
    answer = answer.toUpperCase();
  }

  display.clearLine(19);
  display.writeCenter(
    19,
    DIFFICULTY_LEVELS[answer as keyof typeof DIFFICULTY_LEVELS]!,
    Color.LightGreen,
    Color.Blue
  );

  switch (answer) {
    case 'N':
      world.stats.gems = 20;
      world.stats.teleports = 0;
      world.stats.keys = 0;
      world.stats.whips = 0;
      world.stats.whipPower = 2;
      world.game.difficulty = Difficulty.Novice;
      break;
    case 'E':
      world.stats.gems = 15;
      world.stats.teleports = 0;
      world.stats.keys = 0;
      world.stats.whips = 0;
      world.stats.whipPower = 2;
      world.game.difficulty = Difficulty.Experienced;
      break;
    case 'A':
      world.stats.gems = 10;
      world.stats.teleports = 0;
      world.stats.keys = 0;
      world.stats.whips = 0;
      world.stats.whipPower = 2;
      world.game.difficulty = Difficulty.Advanced;
      world.game.foundSet = true;
      break;
    case '!':
      world.stats.gems = 250;
      world.stats.whips = 100;
      world.stats.teleports = 50;
      world.stats.keys = 1;
      world.stats.whipPower = 3;
      world.game.difficulty = Difficulty.Cheat;
      world.game.foundSet = true;
      break;
    case 'T':
      world.stats.gems = Infinity;
      world.stats.teleports = Infinity;
      world.stats.keys = 1;
      world.stats.whips = Infinity;
      world.stats.whipPower = 4;
      world.game.difficulty = Difficulty.Tourist;
      break;
    case 'B':
      world.stats.gems = 500; // Infinity;
      world.stats.teleports = 50; // Infinity;
      world.stats.keys = 0; // Infinity;
      world.stats.whips = 1000; // Infinity;
      world.stats.whipPower = 3;
      world.game.difficulty = Difficulty.Cheat;
      world.game.foundSet = true;
      world.game.bot = ENABLE_BOTS;
      break;
  }

  return answer;
}

export async function endRoutine() {
  await sound.footStep();
  await delay(200);
  await sound.footStep();
  await delay(200);
  await sound.footStep();

  await flashMessage('Oh no, something strange is happening!');
  await flashMessage('You are magically transported from Kroz!');

  // Check for infinite items
  const gems = (world.stats.gems = isFinite(world.stats.gems)
    ? world.stats.gems
    : 150);
  const whips = (world.stats.whips = isFinite(world.stats.whips)
    ? world.stats.whips
    : 20);
  const teleports = (world.stats.teleports = isFinite(world.stats.teleports)
    ? world.stats.teleports
    : 10);
  const keys = (world.stats.keys = isFinite(world.stats.keys)
    ? world.stats.keys
    : 5);

  await flashMessage('Your Gems are worth 100 points each...');

  for (let i = 0; i < gems; i++) {
    world.stats.gems--;
    world.stats.score += 10;
    renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await flashMessage('Your Whips are worth 100 points each...');
  for (let i = 0; i < whips; i++) {
    world.stats.whips--;
    world.stats.score += 10;
    renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await flashMessage('Your Teleport Scrolls are worth 200 points each...');
  for (let i = 0; i < teleports; i++) {
    world.stats.teleports--;
    world.stats.score += 20;
    renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await flashMessage('Your Keys are worth 10,000 points each....');
  for (let i = 0; i < keys; i++) {
    world.stats.keys--;
    world.stats.score += 1000;
    renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  display.clear(Color.Blue);

  display.drawText(25, 3, 'ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ', Color.White, Color.Blue);

  display.drawText(
    10,
    5,
    dedent`
        Carefully, you place the ancient tome on your table and open
        to the first page.  You read the book intently, quickly
        deciphering the archaic writings.

        You learn of Lord Dullwit, the once powerful and benevolent
        ruler of Kroz, who sought wealth and education for his people.
        The magnificent KINGDOM OF KROZ was once a great empire, until
        it was overthrown by an evil Wizard, who wanted the riches of
        Kroz for himself.

        Using magic beyond understanding, the Wizard trapped Lord
        Dullwit and his people in a chamber so deep in Kroz that any
        hope of escape was fruitless.

        The Wizard then built hundreds of deadly chambers that would
        stop anyone from ever rescuing the good people of Kroz.
        Once again your thoughts becomes clear:  To venture into the
        depths once more and set free the people of Kroz.
       `,
    Color.White,
    Color.Blue
  );

  await flashMessage('Press any key, Adventurer.');
  world.game.done = true;
}
