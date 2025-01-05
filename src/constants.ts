export const DEBUG = import.meta.env.DEV;

export const TITLE = 'The Forgotton Adventures of Kroz';

export const WIDTH = 80;
export const HEIGHT = 25;

export const XBot = 1;
export const XTop = WIDTH - 16;
export const YBot = 1;
export const YTop = HEIGHT - 2;
export const XSize = XTop - XBot;
export const YSize = YTop - YBot;

export const FLOOR_CHAR = ' ';

// Overall time scale... impacts creatre move speed and spell duration
export const TIME_SCALE = 1;

export const TICK_RATE_SCALE = 4; // Lower is faster player movement (should be > 1, 8 is good)
