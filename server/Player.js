'use strict';
let Deck = require('./Deck.js');

class Player{
  constructor(game,user){
    this.user = user;
    this.game = game.id;
    this.number = 0;
    this.ready = false;
    this.ownedSquares = [] //list of square objects that are under the player's control (have a unit or power token on them)
    this.orders = [];
    this.supply = 0;
    this.powerTokens = 5;
    this.castleCount = 0;
    this.strongholdCount = 0;
    this.totalCastles = 0;
    this.actionQueue = [];
  }

  //Places the player's starting units
   initializePlayer(gameObj){
    this.number = gameObj.players.findIndex(this);
    this.house = (playernum == 0) ? 'Baratheon' : (playernum == 1) ? 'Lannister' : (playernum == 2) ? 'Stark' : 'None';
    //this.attackDeck = new Deck('House-'+ this.house + '.txt')

    //update game throne order to defaults
    //this.throneTrack = this.game.gameObj.gameVariables.throneTrack.findIndex(this);
    //this.ravenTrack = this.game.gameObj.gameVariables.ravenTrack.findIndex(this);
    //this.swordTrack = this.game.gameObj.gameVariables.swordTrack.findIndex(this);
    //add units and power tokens to the appropriate square objects based on house - need some sort of house-specific load file

    //update ownedSquares
    //update units on squares
    let list = [1,2,3] //update to reflect houses
    updateTracks(gameObj,list);
    updateSupply();
    updateCastleCount();
  }

  //
   updateTracks(gameObj,list){
    gameObj.gameVariables.throneTrack.findIndex(this.number);
    gameObj.gameVariables.ravenTrack.findIndex(this.number);
    gameObj.gameVariables.swordTrack.findIndex(this.number);
  }

   updateSupply(){
    let supply = 0;
    this.ownedSquares.forEach((square) =>{
      supply += (square.bonus.match(/S/g) || []).length;
    });
    console.log("player supply is",supply)
    this.supply = supply;
  }

  //updates castle, stronghold, total
   updateCastleCount(){
    let castles = 0;
    let strongholds = 0;
    let total = 0;
    this.ownedSquares.forEach((square) => {
      castles += (square.castles.match(/C/g) || []).length;
      strongholds += (square.castles.match(/S/g) || []).length;
      total += (square.castles.match(/SC/g) || []).length;

    });
    console.log("player castle/stronghold/total is",castles, strongholds, total);
    this.castleCount = castles;
    this.strongholdCount = strongholds;
    this.totalCastles = total;
  }

}
module.exports = Player;
