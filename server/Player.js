'use strict';
let Deck = require('./Deck.js');
let PlayerModel = require('../models/PlayerModel.js');
let GameFuncs = require('./GameFunctions.js');


class Player{
  constructor(game,user, cb, players){
    this.id = game.id;
    this.house = ''
    this.ready = false;
    this.ownedSquares = [];
    this.orders = [];
    this.supply = 0;
    this.powerTokens = 5;
    this.castleCount = 0;
    this.strongholdCount = 0;
    this.totalCastles = 0;
    this.actionQueue = [];
    let player = this;
    let p = new PlayerModel({
      user: user,
      object: this,
      gameid: this.id,
      });
    p.save(function(err, p){
      if (err) console.log("error from playerModel",err);
      cb(players, player, game);
      });
  }

  //Places the player's starting units
   initializePlayer(game){
     if (game.gameObj.houses.length == 0){
       GameFuncs.getHouses()
     }
    let number = (Math.round((Math.random()*100)) * game.gameObj.houses.length)/100 - 1;
    console.log("player number", number);
    this.house = game.gameObj.houses.splice(number, 1);
    //this.attackDeck = new Deck('House-'+ this.house)

    //update game throne order to defaults
    //this.throneTrack = this.game.gameObj.gameVariables.throneTrack.findIndex(this);
    //this.ravenTrack = this.game.gameObj.gameVariables.ravenTrack.findIndex(this);
    //this.swordTrack = this.game.gameObj.gameVariables.swordTrack.findIndex(this);
    //add units and power tokens to the appropriate square objects based on house - need some sort of house-specific load file
    let owned = {};
    if (this.house == 'Lannister'){
      owned = {ownedSquares:[['F5',{units:{footman:1,knight:1,siege:0,ship:0,token:1}}],['G5',{units:{footman:0,knight:0,siege:0,ship:1,token:0}}],['E5',{units:{footman:1,knight:0,siege:0,ship:0,token:0}}],['G6',{units:{footman:0,knight:0,siege:0,ship:1,token:0}}]]};//read this in from a file
      this.ownedSquares = ['F5', 'E5', 'G5', 'G6'];
    }
    if (this.house == 'Baratheon'){
      owned = {ownedSquares:[['A6',{units:{footman:1,knight:1,siege:0,ship:0,token:0}}],['B6',{units:{footman:0,knight:0,siege:0,ship:2,token:0}}],['C7',{units:{footman:1,knight:0,siege:0,ship:0,token:1}}]]};//read this in from a file
      this.ownedSquares = ['A6', 'B6', 'C7'];
    }
    if (this.house == 'Stark'){
      owned = {ownedSquares:[['E2',{units:{footman:2,knight:1,siege:0,ship:0,token:1}}],['E3',{units:{footman:1,knight:0,siege:0,ship:0,token:0}}],['C2',{units:{footman:1,knight:0,siege:0,ship:0,token:0}}],['B2',{units:{footman:0,knight:0,siege:0,ship:1,token:0}}],['D2',{units:{footman:0,knight:0,siege:0,ship:0,token:1}}]]};//read this in from a file
      this.ownedSquares = ['E2', 'E3', 'C2', 'B2','D2'];
    }
    //update ownedSquares
    GameFuncs.updateSquares(this.id,owned);
    //update units on squares
    let list = [1,2,3] //update to reflect houses
    //this.updateTracks(gameObj,list);
    //this.updateSupply();
    //this.updateCastleCount();
    return this;
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
module.exports = Player;
