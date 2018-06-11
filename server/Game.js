'use strict';
let Utilities = require('./Utilities.js');
let Deck = require('./Deck.js');
let Player = require('./Player.js');

// function makeIterator(array) {
//     var nextIndex = 0;
//     return {
//        next: function() {
//            return nextIndex < array.length ?
//                {value: array[nextIndex++], done: false} :
//                {done: true};
//        }
//     };
// }
// var it = makeIterator(['yo', 'ya']);
// console.log(it.next().value); // 'yo'

class Game{
  constructor(gameObj,numPlayers, numRounds){
    let startRound = [['conditionalActions',false],['enableOrderSelection',false]]
    let actionRound = [['playersReady',false], ['resetPlayerStatus',false]]
    let attackRound = [['sortOrders',false], ['completeOrders',false], ['playersReady',false],['resetPlayerStatus',false]]
    let endRound = [['seasonCards', false], ['conditionalActions',false], ['playersReady',false], ['resetPlayerStatus',false], ['endTurn',false]]
     let round = [...startRound,...actionRound,...attackRound,...endRound];
    this.game = [];
    let i = 0;
    while (i < numRounds){
      this.game.push(round);
      i++;
    }
    this.gameObj = gameObj;
    this.numPlayers = numPlayers;
    // this.seasonOne = Utilities.shuffle(new Deck('SeasonOne'));
    // this.seasonTwo = Utilities.shuffle(new Deck('SeasonTwo'));
    // this.seasonThree = Utilities.shuffle(new Deck('SeasonThree'));
    // this.wildlingsDeck = Utilities.shuffle(new Deck('Wildlings'));
    console.log("game constructor complete")
    }
  }
  module.exports = Game;
