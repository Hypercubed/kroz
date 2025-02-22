export const DEBUG = import.meta.env.DEV;
export const SHOW_STATS = false;
export const SHOW_DEBUG_CONTROLS = DEBUG;
export const ENABLE_DEBUG_LEVEL = DEBUG;
export const ENABLE_BOTS = DEBUG;
export const ENABLE_DEBUG_INTERFACE = DEBUG;

// Checking for Reduced Motion Preference
// @ts-expect-error - TS doesn't know about matchMedia
export const REDUCED =
  window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
  window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

export const TITLE = 'The Forgotten Adventures of Kroz';

// Screen Size
export const WIDTH = 80;
export const HEIGHT = 25;

// Playing Field
export const XBot = 1;
export const XTop = WIDTH - 16;
export const YBot = 1;
export const YTop = HEIGHT - 2;

export const XMax = 63;
export const YMax = 22;

// Overall time scale... impacts creatre move speed and spell duration
export const TIME_SCALE = 1;
export const CLOCK_SCALE = 8; // Lower is faster player movement (should be > 1, 8 is good)

export const VOLUME = 0.005;
export const BLINK = !REDUCED;

export const FLOOR_CHAR = ' ';
