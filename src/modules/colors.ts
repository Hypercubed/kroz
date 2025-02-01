// PASCAL color codes
export enum Color {
  Black = 0,
  Blue = 1,
  Green = 2,
  Cyan = 3,
  Red = 4,
  Magenta = 5,
  Brown = 6,
  White = 7,
  Grey = 8,
  LightBlue = 9,
  LightGreen = 10,
  LightCyan = 11,
  LightRed = 12,
  LightMagenta = 13,
  Yellow = 14,
  HighIntensityWhite = 15,
}

// PASCAL colors
export const ColorCodes = {
  [Color.Black]: '#000000',
  [Color.Blue]: '#0000AA',
  [Color.Green]: '#00AA00',
  [Color.Cyan]: '#00AAAA',
  [Color.Red]: '#AA0000',
  [Color.Magenta]: '#AA00AA',
  [Color.Brown]: '#AA5500',
  [Color.White]: '#AAAAAA',
  [Color.Grey]: '#AAAAAA',
  [Color.LightBlue]: '#5555FF',
  [Color.LightGreen]: '#55FF55',
  [Color.LightCyan]: '#55FFFF',
  [Color.LightRed]: '#FF5555',
  [Color.LightMagenta]: '#FF55FF',
  [Color.Yellow]: '#FFFF55',
  [Color.HighIntensityWhite]: '#FFFFFF',
};

export async function readColors() {
  const colors = (await import('../data/kroz.colors.json')).default;
  for (const k in colors) {
    const code = Color[k as keyof typeof Color];
    if (!k) continue;
    ColorCodes[code] = colors[k];
  }
}
