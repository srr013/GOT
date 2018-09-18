'use strict';
let Utilities = require('../Utilities.js')

class GameObject{
  constructor(gameid, numplayers){
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
}
module.exports = GameObject;

//attackList = [{players:[attacker, defender], squares:[from, to]}, etc]
//phases: start, actionRound, attackRound, endRound
//conditionalActionList = [{players: who has to act on a prompt?, action: function}]
