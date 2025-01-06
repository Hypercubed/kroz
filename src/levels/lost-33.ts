// Lost Adventures of Kroz, Level 33 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import { FLOOR_CHAR } from '../constants';
import { TileChar, Tile, TileColor } from '../tiles';

/*
//♣///////♣///♣////////♣////////♣//#the#lost#adventures#of#kroz#
0123456789012345678901234567890123456789012345678901234567890123
*/

export const id = 'Lost33';

const map = `
##tunnels#of#kroz###########-P--################################
########################X###----######X##-------D--------##X####
############################----#########-------D--------#######
L---N-----######ò  ò ò######-----------------########----#######
L---N-----##X###  CC  555555-----------------#####X##1111#######
######----######ò ò  ò###############################----#####X#
######1111###########################################1111#######
#X####----##############X#######magic#####X##########----#######
######1111####################“-•-–-•-“##############----N-----#
######----####################---------##############----N-----#
######1111#######X############‘-‘-‘-‘-‘#########X##########----#
######----########################-########################1111#
######1111################X#######-########################----#
######----########################---------N-------------------#
###X##----##########################################-----------#
######----------------ñ########################X####----########
######-----------------444444%######################1111########
###################----#############################----#####X##
###################1111#############X###############1111########
############X######----#############################----########
###################-------N-----------------------------########
##X################-------N-----------------------------##X#####
################################################################
`;

async function onLevelStart() {
  TileChar[Tile.Stairs] = FLOOR_CHAR; // HideGems
  TileColor[Tile.Stairs] = TileColor[Tile.Floor];

  TileChar[Tile.OWall1] = FLOOR_CHAR;
  TileChar[Tile.OWall2] = FLOOR_CHAR;
  TileChar[Tile.OWall3] = FLOOR_CHAR;
}

export default {
  id: 'Lost33',
  map,
  onLevelStart,
};
