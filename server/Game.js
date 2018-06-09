'use strict';
let Utilities = require('./Utilities.js');
let Deck = require('./Deck.js');
let Player = require('./Player.js')

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
     let round = [startRound,actionRound,attackRound,endRound];
    this.game = [];
    let i = 0;
    while (i < numRounds){
      this.game.push([round]);
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
  //Runs the first function it finds that is false at [1]
  stepThrough(){
    let round = this.game[this.gameObj.gameVariables.turnNum-1];
    let i = 0;
    while (round[i][1] == true){
      i++;
    }
    let result = round[i]();
    if (result){
      round[i][1] = true;
      ++i;
      stepThrough()
    }
  }

  addPlayer(user){
    if (this.gameObj.players.length < this.numPlayers){
      this.gameObj.updatePlayerList(new Player(this, user));
    };
      if (this.gameObj.players.length == this.numPlayers){
        this.gameObj.players = Utilities.shuffle(this.gameObj.players);
        this.gameObj.players.forEach((player) =>
      player.initializePlayer(this.gameObj));
      return true;
      }
    return false;
  }
  enableOrderSelection(){
    if (this.gameObj.players.length == this.numPlayers){
      this.gameObj.gamevariables.phase = 'actionRound'; //used by html to display appropriate forms
      return true;
    }
  }
   playersReady(){ //Need a function on server that updates the gameobj.players.orders with player's moves when they emit a 'orders complete' status. This orders list should be sorted first to last: raid orders = 1,2,3, move orders = 4,5,6, consolidate power = 7,8,9. Ideally with gaps.
    let ready = true;
    this.gameObj.players.forEach((player) => {
      if(player.ready == false){
        ready = false;
      }
    return ready;
    });
  }
   resetPlayerStatus(){
    //This should check the phase and mark players not ready or ready depending on if they need to do anything.
    if (this.gameObj.phase == 'endRound'){
      this.gameObj.players.forEach((player) => {
        player.ready = false;
      });
    }else if (this.gameObj.phase == 'actionRound'){
      this.gameObj.gameVariables.attackList.forEach((attack) => {
        attack.players.forEach((player) => {
          player.ready = false;
      });
    });
  }else if (this.gameObj.phase == 'attackRound'){
    this.gameObj.gameVariables.conditionalActionList.forEach((action) => {
      action.players.forEach((player) => {
        player.ready = false;
        });
      return true;
      });
    }
  }
   sortOrders(){
    this.gameObj.phase = 'attackRound';
    let list = this.gameObj.gameVariables.orderList;
    let playerMoves = [];
    //not set up for different playerNums
    let i = 0
    while (i < game.playerNums){
      playerMoves.push(this.gameObj.throneTrack[i].Orders);
      i++;
    }
    let j = 0;
    while (true){
      let order = playerMoves[j].shift();
      if (order == undefined){
        console.log("order = undefined. All done?", list);
        return false;
      }else{
        list.push();
        ++j;
      }
      if (j >= game.playerNums){
        j=0;
      }
    }
    return true;
  };

   completeOrders(){
    console.log("completing orders:", this.gameObj.gameVariables.orderList)
    let list = this.gameObj.gameVariables.orderList;
    while (list.length > 0){
      let order = list.shift();
      order.action(); //Need to add order actions
    }
    return true;
  }
   seasonCards(){//Season cards should compile everything for player input and create a list of actions for conditionalActions to complete w/ player input
    this.gameobj.phase = 'endRound';
    this.seasonOne.drawCard()();//Deck should have a function drawCard that returns the card's effect function
    this.seasonTwo.drawCard()();
    this.seasonThree.drawCard()();

    return true;
  }
   conditionalActions(){
    console.log("completing conditional Actions:", this.gameObj.gameVariables.conditionalActionList)
    let list = this.gameObj.gameVariables.conditionalActionList;
    while (list.length > 0){
      let order = list.shift();
      order.action(); //Need to add order actions
    }
  return true;
  }

   endTurn(){
    if (this.gameObj.gameVariables.turnNum < this.numRounds){
      this.gameObj.turnNum++;
      this.gameObj.attackList = [];
      this.gameObj.orderList = [];
      this.gameObj.players.forEach((player) => {
        player.order = [];
      })
    }else{
      checkEndGame();
    }
  }
   checkEndGame(){
    this.gameObj.players.forEach((player) => {
      if (player.castelCount >= 7){
        //player wins!
        return player;
      }
    });
    if (this.gameObj.gameVariables.turnNum < this.numRounds){
      return false;
    } else{
      //check totalCastles then strongholdCount then supply
      let winList = [];
      let numCastles = 0;
      let numStrongholds = 0;
      let numSupply = 0;
      this.gameObj.players.forEach((player) => {
        if (player.totalCastles > numCastles){
          winList = [player];
        } else if (player.totalCastles = numCastles){
          winList.push(player);
        }
      });
      if (winList.length > 1){
        winList.forEach((player) => {
          if (player.strongholdCount > numStrongholds){
            winList = [player];
          } else if (player.strongholdCount = numCastles){
            winList.push(player);
          }
        });
      }else{
        return winList[0];
        }
      if (winList.length > 1){
        winList.forEach((player) => {
          if (player.strongholdCount > numStrongholds){
            winList = [player];
          } else if (player.strongholdCount = numCastles){
            winList.push(player);
          }
        });
      }else{
        return winList[0];
        }
      if (winList.length > 1){
        winList.forEach((player) => {
          if (player.supply > supply){
            winList = [player];
          } else if (player.supply = supply){
            winList.push(player);
          }
        });
        return winList;
      }else{
        return winList[0];
        }
    }
  }

//end class
}
module.exports = Game
