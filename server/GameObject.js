'use strict';
let Map = require('./Map.js');
let Utilities = require('./Utilities.js')

class GameObject{
  constructor(gameid){
    this.gameId = gameid;
    this.players = [];
    this.map = Map.loadMapFromFile();
    this.gameVariables = {phase:'start',
    throneTrack:[],
    ravenTrack:[],
    swordTrack:[],
    turnNum:1,
    wildlingPower:0,
    attackList:[],
    orderList:[],
    conditionalActionList:[]
    };
  };
   updatePlayerList(player){
    if (this.gameVariables.phase == 'start'){
      this.players.push(player);
      return true;
    }
    else{
      return false;
    }
  }

  //takes in a list of [index,key,value] pairs and updates the map
   updateMap(list){
    list.forEach((update) => {
      this.map[update[0]][update[1]] = update[2];
    });
  }

   updateGameVariables(list){
    list.forEach((update) => {
      this.gameVariables[update[0]] = [update[1]];
    });
  }
}
module.exports = GameObject;

//attackList = [{players:[attacker, defender], squares:[from, to]}, etc]
//phases: start, actionRound, attackRound, endRound
//conditionalActionList = [{players: who has to act on a prompt?, action: function}]
