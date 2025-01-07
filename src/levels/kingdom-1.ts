// KINGDOM OF KROZ II, Level 1 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

/*
//♣///////♣///♣////////♣////////♣//#the#lost#adventures#of#kroz#
0123456789012345678901234567890123456789012345678901234567890123
*/

const map = `
W W W W             2 2 2 2 2  C  2 2 2 2 2              W W W W
XXXXXXXXXXXXXXXXXXX###########   ###########XXXXXXXXXXXXXXXXXXXX
 1           1                               1                  
                                    1            XX         1   
       1            1                           XXXX            
#        XX                    +                 XX            #
##      XXXX  1                +          1          1        ##
T##      XX               2    +    2                        ##T
T1##                       W   +   W                        ##1T
T########X                 WX     XW             1    X########T
.        X                2WX  P  XW2                 X        .
T########X         1       WX     XW                  X########T
T1##                       W   +   W         1              ##1T
T##                       2    +    2                        ##T
##   1                         +                      XX      ##
#       XX      1              +                 1   XXXX     1#
       XXXX                 ##   ##                   XX        
1       XX                 ##     ##     1        1           1 
                    1#######       ########                     
    1         ########11111  +++++  111111########              
WW     ########+++++        #######         WWWWW########1    WW
########¯                    2 2 2                     C########
L2  +  X      #kingdom#of#kroz#ii#by#scott#miller#      X  +  2L`;

export default {
  id: 'Kingdom1',
  map,
  tabletMessage: `Once again you uncover the hidden tunnel leading to Kroz!`,
};

// TODO: ShootRight
