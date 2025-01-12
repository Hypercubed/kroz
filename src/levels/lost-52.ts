// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as world from '../modules/world';

import { Type } from '../data/tiles';
import { Entity } from '../classes/entity';
import { Color } from '../data/colors';

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
  // Change floor character
  world.level.map.replaceEntities(
    Type.Floor,
    new Entity(Type.Floor, '.', Color.White, Color.Black),
  );

  // HideCreate
  world.level.map.hideType(Type.Create);

  // HideMBlock
  world.level.map.hideType(Type.MBlock);
}

export default {
  id: 'Lost52',
  map,
  onLevelStart,
  tabletMessage: 'Up 4 steps, then left 16 steps.',
};
