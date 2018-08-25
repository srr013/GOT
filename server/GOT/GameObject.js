'use strict';
let Utilities = require('../Utilities.js')

class GameObject{
  constructor(gameid){
    this.gameId = gameid;
    this.phase ='start',
    this.throneTrack =[],
    this.ravenTrack =[],
    this.swordTrack = [],
    this.turnNum = 1,
    this.wildlingPower = 0,
    this.attackList = [],
    this.orderList = [],
    this.houses = ['Lannister','Baratheon'],
    this.conditionalActionList = []
  };
   updatePlayerList(players, player){
    if (this.phase == 'start'){
      this.players.push(player);
      return true;
    }
    else{
      return false;
    }
  }

  //takes in a list of [index,key,value] pairs and updates the map
   updateMap(list, gamemap){
    list.forEach((update) => {
      gamemap[update[0]][update[1]] = update[2];
    });
  }

   updateGameVariables(list){
    list.forEach((update) => {
      this[update[0]] = [update[1]];
    });
  }
}
module.exports = GameObject;

//attackList = [{players:[attacker, defender], squares:[from, to]}, etc]
//phases: start, actionRound, attackRound, endRound
//conditionalActionList = [{players: who has to act on a prompt?, action: function}]
