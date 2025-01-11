export const DEBUG = import.meta.env.DEV;

export const TITLE = 'The Forgotton Adventures of Kroz';

export const WIDTH = 80;
export const HEIGHT = 25;

export const XBot = 1;
export const XTop = WIDTH - 16;
export const YBot = 1;
export const YTop = HEIGHT - 2;
export const XSize = 64;
export const YSize = 23;

export const FLOOR_CHAR = ' ';

// Overall time scale... impacts creatre move speed and spell duration
export const TIME_SCALE = 1;
export const CLOCK_SCALE = 5; // Lower is faster player movement (should be > 1, 8 is good)
