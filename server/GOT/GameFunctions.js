'use strict';
let Utilities = require('../Utilities.js');
let Deck = require('../Deck.js');
let Player = require('./Player.js');

let PlayerModel = require('../../models/PlayerModel.js');

exports.getHouses = function(game){
  console.log("in getHouses", game) //not in use currently
  game.gameObj.houses = ['Lannister', 'Baratheon', 'Stark']
}

function enableOrderSelection(game){
  console.log("enabling Order selection");
  if (game.gameObj.players.length == game.numPlayers){
    game.gameObj.gameVariables.phase = 'actionRound';

    //used by html to display appropriate forms
    return [true, game];
  }
  return [false, game];
}

function resetPlayerStatus(game){
  //This should check the phase and mark players not ready or ready depending on if they need to do anything.
  if (game.gameObj.phase == 'endRound'){
    game.gameObj.players.forEach((player) => {
      player.ready = false;
    });
  }else if (game.gameObj.phase == 'actionRound'){
    game.gameObj.gameVariables.attackList.forEach((attack) => {
      attack.players.forEach((player) => {
        player.ready = false;
    });
  });
}else if (game.gameObj.phase == 'attackRound'){
  game.gameObj.gameVariables.conditionalActionList.forEach((action) => {
    action.players.forEach((player) => {
      player.ready = false;
      });
    return true;
    });
  }
}

function sortOrders(game){
  game.gameObj.phase = 'attackRound';
  let list = game.gameObj.gameVariables.orderList;
  let playerMoves = [];
  //not set up for different playerNums
  let i = 0
  while (i < game.playerNum){
    playerMoves.push(game.gameObj.throneTrack[i].Orders);
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

function completeOrders(game){
  console.log("completing orders:", game.gameObj.gameVariables.orderList)
  let list = game.gameObj.gameVariables.orderList;
  while (list.length > 0){
    let order = list.shift();
    if (order = 'Move'){
      //function call
    }//etc.
  }
  return true;
}
function seasonCards(game){//Season cards should compile everything for player input and create a list of actions for conditionalActions to complete w/ player input
  game.gameobj.phase = 'endRound';
  game.seasonOne.drawCard()();//Deck should have a function drawCard that returns the card's effect function
  game.seasonTwo.drawCard()();
  game.seasonThree.drawCard()();

  return true;
}
function conditionalActions(game){
  console.log("completing conditional Actions:", game.gameObj.gameVariables.conditionalActionList)
  let list = game.gameObj.gameVariables.conditionalActionList;
  while (list.length > 0){
    let order = list.shift();
    order.action(); //Need to add order actions
  }
return [true, game];
}

function endTurn(game){
  if (game.gameObj.gameVariables.turnNum < game.numRounds){
    game.gameObj.turnNum++;
    game.gameObj.attackList = [];
    game.gameObj.orderList = [];
    game.gameObj.players.forEach((player) => {
      player.order = [];
    })
  }else{
    checkEndGame(game);
  }
}
function checkEndGame(game){
  game.gameObj.players.forEach((player) => {
    if (player.castelCount >= 7){
      //player wins!
      return player;
    }
  });
  if (game.gameObj.gameVariables.turnNum < game.numRounds){
    return false;
  } else{
    //check totalCastles then strongholdCount then supply
    let winList = [];
    let numCastles = 0;
    let numStrongholds = 0;
    let numSupply = 0;
    game.gameObj.players.forEach((player) => {
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

//Places the player's starting units
 exports.initializePlayer = function (player, gameObj){
  player.object.house = gameObj.houses.splice(0, 1);
  //player.attackDeck = new Deck('House-'+ player.house)

  //update game throne order to defaults
  //player.throneTrack = player.game.gameObj.gameVariables.throneTrack.findIndex(player);
  //player.ravenTrack = player.game.gameObj.gameVariables.ravenTrack.findIndex(player);
  //player.swordTrack = player.game.gameObj.gameVariables.swordTrack.findIndex(player);
  //add units and power tokens to the appropriate square objects based on house - need some sort of house-specific load file
  let owned = {};
  if (player.object.house == 'Lannister'){
    player.object.units.Footman = ['F5', 'E5'];
    player.object.units.Knight = ['F5'];
    player.object.units.Siege = [];
    player.object.units.Ship = ['G5', 'G6'];
    player.object.units.Token = ['F5']
    player.object.ownedSquares = ['F5', 'E5', 'G5', 'G6'];
  }
  if (player.object.house == 'Baratheon'){
    player.object.units.Footman = ['A6', 'C7'];
    player.object.units.Knight = ['A6'];
    player.object.units.Siege = [];
    player.object.units.Ship = ['B6', 'B6'];
    player.object.units.Token = ['C7']
    player.object.ownedSquares = ['A6', 'B6', 'C7'];
  }
  if (player.object.house == 'Stark'){
    player.object.units.Footman = ['E2', 'E2', 'E3','C2'];
    player.object.units.Knight = ['E2'];
    player.object.units.Siege = [];
    player.object.units.Ship = ['B2'];
    player.object.units.Token = ['E2', 'D2']
    player.object.ownedSquares = ['E2', 'E3', 'C2', 'B2','D2'];
  }

  //let list = [1,2,3] //update to reflect houses
  //player.updateTracks(gameObj,list);
  //player.updateSupply();
  //player.updateCastleCount();
  PlayerModel.findOneAndUpdate(
    {_id:player.id},
    {object:player.object},
    function(error,success) {
      if (error){
        console.log("error", error);
      }else{
        console.log("success saving Player", success);
      }
    }
  )
  return player;
}
