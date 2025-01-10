// KINGDOM OF KROZ II, Level 4 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

const map = `
-..............................3#1#2#3##------;------------;----
-##############################-##1#2#3#-######################-
-#.....----......- I#S###### ##K###1#2#3-#///////1///////////1//
-#.-..-....-....-.# # I####1# ######1#2#-#♣1♣♣♣♣♣♣♣♣♣♣♣♣♣1♣♣♣♣♣♣
-#-.-..-..-.....-.# # # ### ## ##1###1#2-#/////1////////////////
-#-.-.-..-..---..-# # ## # ##1## # ###1#-#CCC♣♣♣♣♣♣♣♣♣1♣♣♣♣♣♣1♣♣
-#-.-..-.-.-..-..-# # ### ####  ### K##1-#CCC/////1//////1/////K
-#-..--...-....--.# # ##################-#######################
-#-################                                           à 
---3333333333-CC### #F######################XXXXXXXX###à####-##+
################## ###------------------®###############2###-##+
big#######     ## ####22222222222222222#-##-----------###2##-##K
trouble## RRRRR  #######################-##-####U####-####2####+
######## RRRKRRRR #########$;$$$$$$3$T##-##-----------#####2###3
+++++### RR 2 2 RR ####Z###$############-############‘##Q###2###
++T++## RR 2 P  2RR ### #-U--------------###TT.TT####----####2##
+++++## RR2   2 RR ####1#-####################;###############2#
#O#O#### RR 2  2RR #3## #C####3#3#3#3#3#3#3#3#3#3#3#3#3#3#3#3##D
#X#X##### RRR2CRR ##3## # ###@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@###D
#X#X###### RRRRRR ##3## #3##@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@##K#D
-----; #### RRR  ### ## ###@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#D
-----# #####   # ##W W# ##@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@##@#D
22222#      #####       @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#L`;

export default {
  id: 'Kingdom4',
  map,
  tabletMessage: `Adventurer, try the top right corner if you desire.`,
};

// Needs a teleport from previous level
// Optional shoort left
