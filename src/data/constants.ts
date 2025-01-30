export const DEBUG = import.meta.env.DEV;
export const SHOW_STATS = import.meta.env.DEV;
export const SHOW_DEBUG_CONTROLS = import.meta.env.DEV;
export const ENABLE_DEBUG_LEVEL = import.meta.env.DEV;
export const ENABLE_BOTS = import.meta.env.DEV;

export const TITLE = 'The Forgotton Adventures of Kroz';

export const WIDTH = 80;
export const HEIGHT = 25;

export const XBot = 1;
export const XTop = WIDTH - 16;
export const YBot = 1;
export const YTop = HEIGHT - 2;

export const XMax = 63;
export const YMax = 22;

// Overall time scale... impacts creatre move speed and spell duration
export const TIME_SCALE = 1;
export const CLOCK_SCALE = 16; // Lower is faster player movement (should be > 1, 8 is good)
