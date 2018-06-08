'use strict';
let SquareBuilder = require('./server/SquareBuilder.js');

class GameObject{
  constructor(gameid){
    this.gameId = gameid;
    this.players = [];
    this.map = SquareBuilder.loadMapFromFile();
    this.gameVariables = {phase:'start',throneTrack:[],ravenTrack:[],swordTrack[], turnNum:1, wildlingPower:0, attackList:[], orderList:[], conditionalActionList: []}};
  }
}

//attackList = [{players:[attacker, defender], squares:[from, to]}, etc]
//phases: start, actionRound, attackRound, endRound
//conditionalActionList = [{players: who has to act on a prompt?, action: function}]
