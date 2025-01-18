/// <reference types="@mapeditor/tiled-api" />

// const MAP_WIDTH = 64;
// const MAP_HEIGHT = 23;

const TILE_WIDTH = 24;
const TILE_HEIGHT = 36;

function write(map: TileMap, fileName: string) {
  const layer = map.layerAt(0);
  let asciiMap = '';

  if (layer.isTileLayer) {
    for (let y = 0; y < layer.height; ++y) {
      for (let x = 0; x < layer.width; ++x) {
        const tileId = layer.cellAt(x, y).tileId;
        asciiMap += tileIdToChar(tileId);
      }
      asciiMap += '\n';
    }
  }

  tiled.log('Done!');

  const file = new TextFile(fileName, TextFile.WriteOnly);
  file.write(asciiMap);
  file.commit();
}

function read(filename: string) {
  const file = new TextFile(filename, TextFile.ReadOnly);
  if (!file) return null;

  const map = new TileMap();
  map.tileWidth = TILE_WIDTH;
  map.tileHeight = TILE_HEIGHT;
  map.orientation = TileMap.Orthogonal; // if your map is orthogonal, you don't need to set the orientation, ortho is default
  map.width = 0; // We'll set it later, once we know
  map.height = 0; // We'll set it once we know

  const layer = new TileLayer(); // assuming each CSV encodes a single-layer map...
  const editLayer = layer.edit(); // get the TileLayerEdit object so we can set tiles
  const tileset = tiled.open(tiled.projectFilePath + '/../Display.tsx');
  if (!tileset || !tileset.isTileset) return null; // show an error maybe xP

  while (!file.atEof) {
    let line = file.readLine();
    line = line.split('');
    if (line.length > 0) {
      map.width = Math.max(map.width, line.length);
      for (let x = 0; x < line.length; x++) {
        const tileID = getASCIICode(line[x]); //get the ASCII code of the character
        const tile = tileset.findTile(tileID); //get the Tile from the tileset that has this ID
        editLayer.setTile(x, map.height, tile);
      }
      map.height = map.height + 1;
    }
  }
  editLayer.apply();
  map.addLayer(layer);
  file.close();

  tiled.log('Done!');

  return map;
}

// 8216 - ‘ - 96 ?

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

function getASCIICode(char: string) {
  const code = char.charCodeAt(0);
  const code2 = extendedASCIIMap[code] || code;
  // tiled.log(`char: ${char}, code: ${code}, code2: ${code2}`);
  return code2;
}

function tileIdToChar(tileId: number) {
  const tileId2 = reverseExtendedASCIIMap[tileId] || tileId;
  const char = String.fromCharCode(tileId2);
  // tiled.log(`tileId: ${tileId}, tileId2: ${tileId2}, char: ${char}`);
  return char;
}

const customMapFormat = {
  name: 'KROZ ASCII',
  extension: 'txt',

  write,
  read,
};

tiled.registerMapFormat('kroz', customMapFormat);
