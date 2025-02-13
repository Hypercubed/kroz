import { MiniSignal } from 'mini-signals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const gameStart = new MiniSignal<[any]>();

export const levelStart = new MiniSignal<never[]>();
