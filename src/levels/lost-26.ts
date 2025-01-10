// Lost Adventures of Kroz, Level 26 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as screen from '../modules/screen';
import * as sound from '../modules/sound';
import * as state from '../modules/state';

import { FLOOR_CHAR, XSize, YSize } from '../data/constants';
import { TileChar, Tile } from '../data/tiles';

const map = `
::::::::::::::::::::::::::::::::::::::::::::::::####amulet####::
:###########::::::::::::::::::::::::::::::::::::#55]-----]---#::
:#         #::::::::::::::::::::::::::::::::::::#ƒ5----]--L-ò#::
:#    P   HOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO::::::#55-]------]-#::
:#K        #::::::O::::::::::::-:::::::::O::::::###D##########::
:###########::::::O::::::::::::-:::::::::O:::::::::O::::::::::::
::::::::::::::::::O::::::::::::-:::::::::O:::::::::O::-----:::::
::::::::::::::::::O::::::::::::-:::::::::O:::::::::O::+++:-:::::
::::::::::::::::::O::::::::::::-:::::::::O:::::::::O::+++:-:::::
::::::::::::::::::O::::::::::::-:::::::::O:::::::::O::::::-:::::
:::::::::::OOOOOOOO::::::::::::-::::#####D###::::::O::::::-:::::
:::::::::::O:::::::::::::::::::-::::#K;     #::::::OOOOO::-:::::
:::::::::::O:::::::::::::::::::-::::#;;     #::::::::::O::-:::::
:::::######D#############::::::-::::# W     #::::::::::O::-:::::
:::::#!---...----T---I--#::::::-::::#       #::::::::::O::-:::::
:::::#----K----F---’---ñ#::::::-::::#     * #::::::::::O::-:::::
:::::#-S---I----------Z-#::::::-::::#       #::::::::::O::-:::::
:::::####################::::::-::::#   W   #::::::::::O::-:::::
:::::::::::::::::::::::::::::::-::::#       #::::::::::O::-:::::
:::::::::::::::::::::::::::::::-::::#4444444#::::::::::O::-:::::
::::::::::::::::::::::::+++::::-::::#K;-----DOOOOOOOOOOOOOOOOO::
###rogue###:::::::::::::+++-----::::#########:::::::::::::::::::
#was#hereÃ#:::::::::::::::::::::::::::::::::::::::::::::::::::::
`;

async function onLevelStart() {
  TileChar[Tile.Create] = FLOOR_CHAR;
  TileChar[Tile.Gem] = FLOOR_CHAR;
}

async function tabletMessage() {
  await screen.flashMessage(
    `No one has ever made it to the ${state.stats.levelIndex} level!`,
  );
  await screen.flashMessage(
    'You have shown exceptional skills to reach this far...',
  );
  await screen.flashMessage('Therefore I grant you the power to see...');

  // Show IWalls
  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      if (state.level.map.get(x, y) === Tile.IWall) {
        await sound.play(x * y, 1, 10);
        state.level.map.set(x, y, Tile.OWall3);
        screen.drawTile(x, y, Tile.OWall3);
      }
    }
  }

  await screen.flashMessage('Behold...your path awaits...');
}

export default {
  id: 'Lost26',
  map,
  onLevelStart,
  tabletMessage,
};

// TODO: block trap '’'
