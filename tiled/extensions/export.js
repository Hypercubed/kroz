/// <reference types="@mapeditor/tiled-api" />
// const MAP_WIDTH = 64;
// const MAP_HEIGHT = 23;
var TILE_WIDTH = 24;
var TILE_HEIGHT = 36;
function write(map, fileName) {
    var layer = map.layerAt(0);
    var asciiMap = '';
    if (layer.isTileLayer) {
        for (var y = 0; y < layer.height; ++y) {
            for (var x = 0; x < layer.width; ++x) {
                var tileId = layer.cellAt(x, y).tileId;
                asciiMap += tileIdToChar(tileId);
            }
            asciiMap += '\n';
        }
    }
    tiled.log('Done!');
    var file = new TextFile(fileName, TextFile.WriteOnly);
    file.write(asciiMap);
    file.commit();
}
function read(filename) {
    var file = new TextFile(filename, TextFile.ReadOnly);
    if (!file)
        return null;
    var map = new TileMap();
    map.tileWidth = TILE_WIDTH;
    map.tileHeight = TILE_HEIGHT;
    map.orientation = TileMap.Orthogonal; // if your map is orthogonal, you don't need to set the orientation, ortho is default
    map.width = 0; // We'll set it later, once we know
    map.height = 0; // We'll set it once we know
    var layer = new TileLayer(); // assuming each CSV encodes a single-layer map...
    var editLayer = layer.edit(); // get the TileLayerEdit object so we can set tiles
    var tileset = tiled.open(tiled.projectFilePath + "/../Display.tsx");
    if (!tileset || !tileset.isTileset)
        return null; // show an error maybe xP
    while (!file.atEof) {
        var line = file.readLine();
        line = line.split("");
        if (line.length > 0) {
            map.width = Math.max(map.width, line.length);
            for (var x = 0; x < line.length; x++) {
                var tileID = getASCIICode(line[x]); //get the ASCII code of the character
                var tile = tileset.findTile(tileID); //get the Tile from the tileset that has this ID
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
var extendedASCIIMap = {
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
var reverseExtendedASCIIMap = {
    145: 8216, // ‘ - TBlock
    146: 8217, // ’ - TRock
    147: 8220, // “ - TGem
    148: 8221, // ” - TBlind
    149: 8226, // • - TWhip
    150: 8211, // – - TGold
    151: 8212, // — - TTree
    159: 402, // ƒ - Amulet
};
function getASCIICode(char) {
    var code = char.charCodeAt(0);
    var code2 = extendedASCIIMap[code] || code;
    // tiled.log(`char: ${char}, code: ${code}, code2: ${code2}`);
    return code2;
}
function tileIdToChar(tileId) {
    var tileId2 = reverseExtendedASCIIMap[tileId] || tileId;
    var char = String.fromCharCode(tileId2);
    // tiled.log(`tileId: ${tileId}, tileId2: ${tileId2}, char: ${char}`);
    return char;
}
var customMapFormat = {
    name: 'KROZ ASCII',
    extension: 'txt',
    write: write,
    read: read
};
tiled.registerMapFormat('kroz', customMapFormat);
