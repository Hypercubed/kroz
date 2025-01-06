// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import { FLOOR_CHAR } from '../constants';
import { TileChar, Tile } from '../tiles';

/*
//♣///////♣///♣////////♣////////♣//#the#lost#adventures#of#kroz#
0123456789012345678901234567890123456789012345678901234567890123
*/

const map = `
‘  ]  ‘]‘   ]‘‘] ”]]–  ‘‘‘]‘‘” ] – ‘    ‘]‘‘         –]‘”‘] ‘---
 ‘– ‘] ‘ ”‘] ‘– ‘ ]‘ ‘‘ ]”‘–] ‘ ‘ ‘ ]‘‘” ]– ‘‘]‘‘–]‘” ‘]‘‘ ‘ -P-
  –‘‘]‘ ”‘] –‘ ‘] ‘ ‘‘]”ñ –‘] ‘‘‘]‘–”]‘‘ ‘ ]‘‘    –] ‘”‘] ‘‘‘---
–‘ ‘]”‘‘]‘ ‘–]‘ ‘” ]‘‘‘]–‘ ‘]‘   ”‘]‘‘–  ] ‘‘ ‘]”‘  ‘]‘–‘] ‘‘”]‘
‘]–  ‘‘]‘‘” ]‘ –‘]‘‘  ‘]‘” ‘]–‘‘] ‘‘‘] ”‘– ]‘‘   ‘]‘‘”]‘–‘]  ‘‘‘
‘‘–]” ‘‘]‘‘‘ ]‘ –”  ]‘  ‘‘] ‘‘‘] –‘”  ]‘‘‘ ]‘‘–]” ‘‘]   ‘‘‘]‘ –‘
”‘‘] ‘‘‘  ]–‘  ”] ‘‘‘]‘‘ –]‘ ‘‘ ]”‘ ‘]‘‘–]‘ ‘”]‘‘ ‘] ‘–‘ ]‘‘”] ‘
‘]‘ –‘  ]‘ ‘”]‘‘ ‘]–  ‘‘] ‘”‘  ]‘‘ ‘–]‘‘”]‘‘  ‘]‘‘  –]  ‘”‘]‘‘‘ 
–‘ ]‘ ”‘]‘‘     ‘]‘ –‘ ]”‘ ‘]‘‘–] ‘‘     ‘]”‘‘ ]‘‘–]‘ ‘”]‘  ‘‘ ]
‘ –] ‘‘‘ ]”‘‘]‘–‘] ‘‘”] ‘‘‘ ]–‘‘ ]‘ ‘”]‘‘ ‘–]‘‘ ‘‘]” ‘‘]‘ –‘ ]‘ 
 ‘” ]‘‘ ‘ – ] ‘ ‘‘] ‘”‘] ‘–‘ó]‘‘ ‘]‘ ”‘]–‘ ‘]‘‘ò‘]” ‘–]‘‘ ‘] ‘ ‘
]  ”–‘ ]‘‘ ‘ ] ‘   ‘–]”‘‘   ]‘‘‘]   ‘–”]‘‘‘    ]‘‘‘]     ‘–”] ‘‘
#####444############follow#the#bread#crumbs#####################
àààà#555#&àààààààààààààààààààààààààààààààààààààààà@MMMMMMMMK##LL
àààà66666ààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##“‘
àààààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##\`\`
àààààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##‘“
ààààààààààààààààààààààààà!àààààààààààààààààààààààà@MMMMMMMMM##\`\`
àààààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##“‘
àààààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##--
àààààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##--
00àààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##--
K0àààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM66--
`;

async function onLevelStart() {
  TileChar[Tile.Floor] = '·';
  TileChar[Tile.Create] = FLOOR_CHAR;
  // TileChar[Tile.MBlock] = FLOOR_CHAR;
}

export default {
  id: 'Lost52',
  map,
  onLevelStart,
  tabletMessage: 'Up 4 steps, then left 16 steps.',
};

// MakeFloor(0,6,7,0,0);
