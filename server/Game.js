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
  constructor(gameid, numPlayers, numRounds){
    this.id = gameid;
    let startRound = [['conditionalActions',false],['enableOrderSelection',false]]
    let actionRound = [['playersReady',false], ['resetPlayerStatus',false]]
    let attackRound = [['sortOrders',false], ['completeOrders',false], ['playersReady',false],['resetPlayerStatus',false]]
    let endRound = [['seasonCards', false], ['conditionalActions',false], ['playersReady',false], ['resetPlayerStatus',false], ['endTurn',false]]
    this.round = [...startRound,...actionRound,...attackRound,...endRound];
    this.game = Array.from(this.round);
    this.numRounds = numRounds;
    this.currentRound = 1;
    this.numPlayers = numPlayers;
    // this.seasonOne = Utilities.shuffle(new Deck('SeasonOne'));
    // this.seasonTwo = Utilities.shuffle(new Deck('SeasonTwo'));
    // this.seasonThree = Utilities.shuffle(new Deck('SeasonThree'));
    // this.wildlingsDeck = Utilities.shuffle(new Deck('Wildlings'));
    console.log("game constructor complete")
    }
  }
  module.exports = Game;
