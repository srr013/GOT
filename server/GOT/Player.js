'use strict';
let Deck = require('../Deck.js');
let PlayerModel = require('../../models/PlayerModel.js');


module.exports = class Player{
  constructor(game, user){
    this.gameid = game.gameRounds.id;
    this.house = ''
    this.ready = false;
    this.ownedSquares = [];
    this.units = {
      Knight:0,
      Footman:0,
      Siege:0,
      Ship:0,
      Token:0,
    }
    this.orders = [];
    this.supply = 0;
    this.powerTokens = 5;
    this.castleCount = 0;
    this.strongholdCount = 0;
    this.totalCastles = 0;
    this.actionQueue = [];

    let p = new PlayerModel({
      user: user,
      object: this,
      gameid: game.gameRounds.id,
      });
    //game.players.push(p);

    return [p, {playerid:p._id, userid:user}];
  }

  //
   updateTracks(gameObj,list){
    gameObj.throneTrack.findIndex(this.number);
    gameObj.ravenTrack.findIndex(this.number);
    gameObj.swordTrack.findIndex(this.number);
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
