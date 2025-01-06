// Lost Adventures of Kroz, Level 26 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as screen from '../screen';
import * as sound from '../sound';
import * as state from '../state';
import * as world from '../world';

import { FLOOR_CHAR, XSize, YSize } from '../constants';
import { TileChar, Tile } from '../tiles';

/*
//♣///////♣///♣////////♣////////♣//#the#lost#adventures#of#kroz#
0123456789012345678901234567890123456789012345678901234567890123
*/

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
    `No one has ever made it to the ${state.state.levelIndex} level!`,
  );
  await screen.flashMessage(
    'You have shown exceptional skills to reach this far...',
  );
  await screen.flashMessage('Therefore I grant you the power to see...');

  // Show IWalls
  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      if (state.state.PF[x][y] === Tile.IWall) {
        await sound.play(x * y, 1, 10);
        state.state.PF[x][y] = Tile.OWall3;
        world.drawTile(x, y, Tile.OWall3);
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
