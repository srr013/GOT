'use strict';
let Utilities = require('../Utilities.js');
let Deck = require('../Deck.js');
let Player = require('./Player.js');
let Standard_Functions = require('../Standard_Functions.js');

let PlayerModel = require('../../models/PlayerModel.js');
let GameModel = require('../../models/Game.js');

exports.getHouses = function(game){
  console.log("in getHouses", game) //not in use currently
  game.gameObj.houses = ['Lannister', 'Baratheon'];
}

exports.enableOrderSelection = function(allData){
  console.log("enabling Order selection");
  if (allData[0].players.length == allData[0].gameRounds.numPlayers){
    allData[0].gameObj.phase = 'ordering';
    return [true, allData];
  }
  console.log("false");
  return [false, allData];
}

exports.resetPlayerStatus = function(allData){
  //This should check the phase and mark players not ready or ready depending on if they need to do anything.
  let saveToDB = function(player){
    PlayerModel.findOneAndUpdate(
      {_id:player.id},
      {$set: {'object.ready':false}},
      function(error,success) {
        if (error){
          console.log("error", error);
        }else{
          console.log("success saving", success);
        }}
    )
  }
  if (allData[0].gameObj.phase == 'endRound'){
    allData[1].forEach((player) => {
      player.object.ready = false;
      saveToDB(player);
    });
  }else if (allData[0].gameObj.phase == 'ordering'){
    allData[1].forEach((player)=>{
        player.object.ready = false;
        saveToDB(player);
      });
  }else if (allData[0].gameObj.phase == 'attackRound'){
    allData[0].gameObj.conditionalActionList.forEach((action) => {
      action.players.forEach((player) => {
        player.object.ready = false;
        saveToDB(player);
        });
      });
    }
  console.log("resetting player status")
  return [true, allData];
}

exports.playersReady = function(allData){
  console.log("checking player status");
  let ready = true;
  allData[1].forEach((player) => {
    if (player.object.ready == false){
      ready = false
    }
  });
  return [ready, allData];
}

function playerOwnsSquare(player,squareID){
  let owned = false;
  player.object.ownedSquares.forEach((s)=>{
    if (s.id == squareID){
      owned = true;
    }
  })
  return owned;
}

function getOwnedSquareIndex(player, squareID){
  i = 0;
  player.object.ownedSquares.forEach((s) =>{
    if (s.id == squareID){
      return i;
    }else{
      i++;
    }
  })
}

function newOwnedSquare(squareID){
  return {
      id:squareID,
      ownedSupport:0,
      enemySupport:0,
      unitDefense:0,
      orderDefense:0,
      totalDefense:0,
      }
}

function updateOwnedSquare(player, squareID){
  let ownedSquareIndex = getOwnedSquareIndex(player, squareID);
  let unitDefense = 0;
  for (let property in player.object.units) {
    if (object.hasOwnProperty(property)) {
        property.forEach((p)=>{
          if (p == squareID){
            (property == 'Footman') ? ++unitDefense : (property == 'Knight') ? unitDefense = unitDefense + 2 : (property == 'Ship') ? ++unitDefense : null; //update unitDefense
            player.object.ownedSquares[ownedSquareIndex].unitDefense = unitDefense;
            player.object.ownedSquares[ownedSquareIndex].totalDefense = unitDefense + player.object.ownedSquares[ownedSquareIndex].orderDefense
          }
        })
    }
  }
  Standard_Functions.updatePlayerObject(player);
  console.log("Owned Square Update", player.object.ownedSquares)
}

exports.sortOrders = function(allData){
  let i = 0;
  let j = 0;
  let priority = 1;
  let sort = ['Raid','Move','Consolidate Power'];
  allData[0].gameObj.phase = 'attackRound';

  let orderedPlayerList = [];
  allData[0].gameObj.throneTrack.forEach((player)=>{
    allData[1].forEach((p)=>{
      if (player.toString() == p._id.toString()){
        orderedPlayerList.push(p);
      }
    })
  });
  //console.log("Ordered Player list", orderedPlayerList)
  while (i < sort.length){
    while (j < orderedPlayerList.length){
      orderedPlayerList[j].object.orders.forEach((order)=>{
        if (order.name == sort[i] && order.priority == priority){
            order.player = orderedPlayerList[j]._id;
            order.gameid = allData[0]._id;
            allData[0].gameObj.orderList.push(order)
          }
        })
      j++;
    };
    j = 0;
    i++;
    priority = 1;
  };
  console.log("sorted order list", allData[0].gameObj.orderList)
  return [true, allData];
};

exports.completeOrders = function(allData){
  let orderList = allData[0].gameObj.orderList.slice(0);
  allData[0].gameObj.orderList.forEach((order)=>{
    if (order.name == 'Raid'){
      orderList = performRaid(order, orderList);
    }
  })
  console.log("completing orders:", orderList)
  orderList.forEach((order)=>{
    if (order.name == 'Move'){
      performUnitMove(order);
    }else if (order.name == 'Consolidate Power'){
      updatePowerTokens(order.player,1);
    }
  })
  GameModel.update({_id:allData[0]._id},
  {$set: {'gameObj.orderList':[]}},
  function(error,success) {
    if (error){
      console.log("error", error);
    }else{
      console.log("success saving", success);
    }}
);
  return [true, allData];
}

function performUnitMove(order){
  //look up destination squares and see if owned by someone else. If not then update unit location in Player. If so then log an attack. When an attack is complete it should use this function to change unit location.
  let user = '';
  let competitors = '';
  Standard_Functions.getAllPlayersData(order.gameid).then((players) => {
  //Get the ordering user and competitors
    players.forEach((player)=>{
      if (player._id == order.player){
          user = player;
      }else{
        competitors.push(player);
      }
    })
    if (order.picktoken){
      updatePowerTokens(order.player,1);
    }
    order.destinations.forEach((dest)=>{
      //for each destination log an attack or move the units. Update the Player once complete.

      let attack = false;
      competitors.forEach((c) => {
        if (!playerOwnsSquare(c, dest[1])
            && dest[2]){
          createAttack(order, dest, user, c);
          attack = true;
        }
      })
      if (!attack){
        let i = 0;
        while ( i < user.object.units[dest[0]].length){
          if (user.object.units[dest[0]][i] == order.id){
            user.object.units[dest[0]].splice(i,1,dest[1]);//replaces old square with new
          }else{
            i++;
          }
        }
        if (!playerOwnsSquare(user,dest[1])){
          user.object.ownedSquares.push(newOwnedSquare(dest[1]));
          updateOwnedSquare(user,order.id);
        }
      }
    })
    Standard_Functions.updatePlayerObject(user);
  })
}

function createAttack(order, orderDest, attacker, defender){
  Standard_Functions.getGameData(order.gameid).then((game) => {
    game.gameObj.attackList.forEach((attack) =>{
      if (attack.origin == order.id && attack.destination == orderDest[1]){
        attack.attackUnitStrength += (orderDest[0] == 'Footman') ? 1 : (orderDest[0] == 'Kight') ? 2 : (orderDest[0] == 'Siege') ? 4 : (orderDest[0] == 'Ship') ? 1 : 0;
      }
    })
    ownedSquare = defense.object.ownedSquares[getOwnedSquareIndex(defender, orderDest)]
    attack = {
      origin: order.id,
      destination: orderDest[1],
      attackUnitStrength: (orderDest[0] == 'Footman') ? 1 : (orderDest[0] == 'Kight') ? 2 : (orderDest[0] == 'Siege') ? 4 : (orderDest[0] == 'Ship') ? 1 : 0,
      defenseStrength:ownedSquare.totalDefense,
      attackSupport: ownedSquare.enemySupport,
    }
    game.gameObj.attackList.push(attack)
  })
}


function performRaid(raid, orderList){
  //get list of neighboring squares
  let squares = Utilities.getNeighbors(raid.id);
  //check order list to see if there's a corresponding order for each square
  squares.forEach((s) =>{
    let i = 0;
    orderList.forEach((o) =>{
      if (o.id == s && o.player != raid.player && o.type != 1){
        if (o.type == 4 && raid.star &&
          (raid.preference == 4 || raid.preference == 0)){//Raid
          orderList.splice(i,1);
          return orderList;
        }else if (o.type == 5 &&
        (raid.preference == 5 || raid.preference == 0)){ //CP
          updatePowerTokens(o.player,-1);
          updatePowerTokens(raid.player,1);
          orderList.splice(i,1);
          return orderList;
        }else if (o.type == 3 &&
          (raid.preference == 3 || raid.preference == 0)){//Raid
          orderList.splice(i,1);
          return orderList;
        }else if (o.type == 2 &&
          (raid.preference == 2 || raid.preference == 0)){//Support
          orderList.splice(i,1);
          return orderList;
        }
      }
      i++;
    })
  })
  if (raid.preference != 0){
    raid.preference = 0;
    orderList = performRaid(raid, orderList)
  }
  return orderList;
}

function updatePowerTokens(playerID, num){
  //Add to power tokens or add action to queue for player to muster.
  if (order.star){
    //queue up Muster vs collect choice then subsequent action
  }else{
    PlayerModel.update(
      {_id: playerID},
      {$inc: {'object.powerTokens':num}}
    )
  }
};
exports.seasonCards = function(allData){//Season cards should compile everything for player input and create a list of actions for conditionalActions to complete w/ player input
  allData[0].gameObj.phase = 'endRound';
  allData[0].gameObj.seasons[0].drawCard()();//Deck should have a function drawCard that returns the card's effect function
  allData[0].gameObj.seasons[1].drawCard()();
  allData[0].gameObj.seasons[2].drawCard()();

  return true;
}
exports.conditionalActions = function(allData){
  console.log("completing conditional Actions:", allData[0].gameObj.conditionalActionList)
  let list = allData[0].gameObj.conditionalActionList;
  while (list.length > 0){
    let order = list.shift();
    order.action(); //Need to add order actions
  }
return [true, allData];
}

exports.endTurn = function(allData){
  if (allData[0].gameObj.turnNum < allData[0].gameRounds.numRounds){
    allData[0].gameObj.turnNum++;
    allData[0].gameObj.attackList = [];
    allData[0].gameObj.orderList = [];
    allData[0].gameObj.players.forEach((player) => {
      player.order = [];
    })
  }else{
    checkEndGame(allData);
  }
}
exports.checkEndGame = function(allData){
  allData[1].forEach((player) => {
    if (player.object.totalCastles >= 7){
      //player wins!
      return player;
    }
  });
  if (allData[0].gameObj.turnNum < allData[0].gameRounds.numRounds){
    return false;
  } else{
    //check totalCastles then strongholdCount then supply
    let winList = [];
    let numCastles = 0;
    let numStrongholds = 0;
    let numSupply = 0;
    allData[1].forEach((player) => {
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
        } else if (player.strongholdCount = numStrongholds){
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
 exports.initializePlayer = function (player, game){
  player.object.house = game.gameObj.houses.splice(0, 1)[0];
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
    let squares = ['F5', 'E5', 'G5', 'G6'];
    squares.forEach((s)=>{
      player.object.ownedSquares.push(newOwnedSquare(s))
    })
  }
  if (player.object.house == 'Baratheon'){
    player.object.units.Footman = ['A6', 'C7'];
    player.object.units.Knight = ['A6'];
    player.object.units.Siege = [];
    player.object.units.Ship = ['B6', 'B6'];
    player.object.units.Token = ['C7']
    let squares = ['A6', 'B6', 'C7'];
    squares.forEach((s)=>{
      player.object.ownedSquares.push(newOwnedSquare(s))
    });
  }
  if (player.object.house == 'Stark'){
    player.object.units.Footman = ['E2', 'E2', 'E3','C2'];
    player.object.units.Knight = ['E2'];
    player.object.units.Siege = [];
    player.object.units.Ship = ['B2'];
    player.object.units.Token = ['E2', 'D2']
    let squares = ['E2', 'E3', 'C2', 'B2','D2'];
    squares.forEach((s)=>{
      player.object.ownedSquares.push(newOwnedSquare(s))
    });
  }

  //let list = [1,2,3] //update to reflect houses
  //player.updateTracks(gameObj,list);
  //player.updateSupply();
  //player.updateCastleCount();
  Standard_Functions.updatePlayerObject(player);
  GameModel.update(
    {_id:game.id},
  {gameObj:game.gamObj},
  function(error,success) {
    if (error){
      console.log("error", error);
    }else{
      console.log("success saving game", success);
    }
  })
}


exports.initializeTracks = function(players, game){
  let throne = [];
  let sword = [];
  let raven = [];
  players.forEach((p)=>{
    if (p.object.house == 'Baratheon'){
      throne[0] = p._id;
      sword[1] = p._id;
      raven[1] = p._id;
    } else if (p.object.house == 'Lannister'){
      throne[1] = p._id;
      sword[0] = p._id;
      raven[0] = p._id;
    } else if (p.object.house == 'Stark'){
      throne[1] = p._id;
      sword[0] = p._id;
      raven[2] = p._id;
      }
    })
  //console.log("Tracks:", throne, sword, raven);
  game.gameObj.throneTrack = throne;
  game.gameObj.swordTrack = sword;
  game.gameObj.ravenTrack = raven;
  GameModel.update(
    {_id:game._id},
    {gameObj:game.gameObj},
    function(error,success) {
      if (error){
        console.log("error", error);
      }else{
        console.log("success saving Game", success);
      }}
  )
}
