export function delay(duration: number = 0) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

const extendedASCIIMap = {
  // Add mappings for characters that don't match
  8216: 145, // ‘ - TBlock
  8217: 146, // ’ - TRock
  8220: 147, // “ - TGem
  8221: 148, // ” - TBlind
  8226: 149, // • - TWhip
  8211: 150, // – - TGold
  8212: 151, // — - TTree
  402: 159, // ƒ - Amulet
};

const reverseExtendedASCIIMap = {
  145: 8216, // ‘ - TBlock
  146: 8217, // ’ - TRock
  147: 8220, // “ - TGem
  148: 8221, // ” - TBlind
  149: 8226, // • - TWhip
  150: 8211, // – - TGold
  151: 8212, // — - TTree
  159: 402, // ƒ - Amulet
};

export function getASCIICode(char: string) {
  const code = char.charCodeAt(0);
  const code2 = extendedASCIIMap[code as keyof typeof extendedASCIIMap] || code;
  // tiled.log(`char: ${char}, code: ${code}, code2: ${code2}`);
  return code2;
}

export function tileIdToChar(tileId: number) {
  const tileId2 =
    reverseExtendedASCIIMap[tileId as keyof typeof reverseExtendedASCIIMap] ||
    tileId;
  const char = String.fromCharCode(tileId2);
  // tiled.log(`tileId: ${tileId}, tileId2: ${tileId2}, char: ${char}`);
  return char;
}

// Converts properties array to object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ensureObject(array: unknown): Record<string, any> {
  if (Array.isArray(array)) {
    const properties: Record<string, unknown> = {};
    for (const p of array) properties[p.name] = p.value;
    return properties;
  }
  return array as unknown as Record<string, unknown>;
}
