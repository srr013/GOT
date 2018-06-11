'use strict';
let Utilities = require('./Utilities.js');
let Deck = require('./Deck.js');
let Player = require('./Player.js');

//Runs the first function it finds that is false at [1]
exports.stepThrough = function(game){
  let round = game.game[game.gameObj.gameVariables.turnNum-1];
  let i = 0;
  while (round[i][1] == true){
    i++;
  }
  let result = eval(round[i][0]+'(game)');
  let newresult = ''
  console.log(result);
  if (result[0]){
    round[i][1] = true;
    ++i;
    newresult = this.stepThrough(result[1])[1];
  }else{
    return result;
  }
  return newresult;
}

exports.addPlayer = function(user, game){
  if (game.gameObj.players.length < game.numPlayers){
    game.gameObj.updatePlayerList(new Player(game, user));
  };
  if (game.gameObj.players.length == 1){
    game.gameObj.players = Utilities.shuffle(game.gameObj.players);
    game.gameObj.players.forEach((player) => {
      player.initializePlayer(game.gameObj);
    });
    return true, game;
  }
return false;
}
exports.updateSquares = function(gameObj, updates){
  updates.ownedSquares.forEach((square)=>{
    gameObj.map.forEach((x) => {
      x.forEach((y) =>{
        if (y.id == square[0]){
          if (square[1].units){
            y.units = square[1].units;
          }
        }
      })
    })

  })

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
 function playersReady(game){ //Need a function on server that updates the gameobj.players.orders with player's moves when they emit a 'orders complete' status. This orders list should be sorted first to last: raid orders = 1,2,3, move orders = 4,5,6, consolidate power = 7,8,9. Ideally with gaps.
  let ready = true;
  game.gameObj.players.forEach((player) => {
    if(player.ready == false){
      ready = false;
    }
  return ready;
  });
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
  while (i < game.playerNums){
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
    order.action(); //Need to add order actions
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
