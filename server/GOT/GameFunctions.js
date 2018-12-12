'use strict';
let Utilities = require('../Utilities.js');
let Deck = require('../Deck.js');
let Player = require('./Player.js');
let Standard_Functions = require('../Standard_Functions.js');
let OwnedSquares = require('./OwnedSquares.js');

let PlayerModel = require('../../models/PlayerModel.js');
let GameModel = require('../../models/Game.js');

exports.getHouses = function(game){
  console.log("in getHouses", game) //not in use currently
  game.gameObj.houses = ['Lannister', 'Baratheon'];
  return game;
}

exports.enableOrderSelection = function(allData){
  console.log("enabling Order selection");
  if (allData[0].gameObj.phase == 'start' && allData[0].players.length == allData[0].gameRounds.numPlayers){
    allData[0].gameObj.phase = 'ordering';
    return [true, allData, "Order selection enabled"];
  }
  console.log("false");
  return [false, allData];
}

exports.resetPlayerStatus = function(allData){
  //This should check the phase and mark players not ready or ready depending on if they need to do anything.
  if (allData[0].gameObj.phase == 'endRound'){
    allData[1].forEach((player) => {
      player.object.ready = false;
      //saveToDB(player);
    });
  }else if (allData[0].gameObj.phase == 'ordering'){
    allData[1].forEach((player)=>{
        player.object.ready = false;
        //saveToDB(player);
      });
  }else if (allData[0].gameObj.phase == 'attackRound'){
    allData[0].gameObj.conditionalActionList.forEach((action) => {
      action.players.forEach((player) => {
        player.object.ready = false;
        //saveToDB(player);
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
  return [ready, allData, (ready == true) ? ["All players ready"] : []];
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
  console.log("Ordered Player list", orderedPlayerList)
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
  //console.log("sorted order list", allData[0].gameObj.orderList)
  //clear orders from players.
  allData[1].forEach((p)=>{
    p.object.orders = [];
  })
  return [true, allData];
};

exports.completeOrders = function(allData){
  let messages = [];
  let orderList = allData[0].gameObj.orderList.slice(0);
  let message = '';
  console.log("completing orders:", orderList)
  allData[0].gameObj.orderList.forEach((order)=>{
    if (order.name == 'Raid'){
      orderList, message = performRaid(order, orderList);
      messages.push(message);
    }
  })
  orderList.forEach((order)=>{
    if (order.name == 'Move'){
      allData, message = performUnitMove(order, allData);
      messages.push(message);
    }else if (order.name == 'Consolidate Power'){
      allData, message = updatePowerTokens(order.player, 1, allData, order);
      messages.push(message);
    }
  })
  return [true, allData, messages];
}

function performUnitMove(order, allData){
  //look up destination squares and see if owned by someone else. If not then update unit location in Player. If so then log an attack. When an attack is complete it should use this function to change unit location.

  let message = '';
  //Get the ordering user and competitors
  let [user, competitors] = exports.getPlayerFromOrder(allData);
  if (order.picktoken){
    //remove token from square and add it to user pile
    let i = 0;
    user.object.units['Token'].forEach((token)=>{
      if (token == order.id){
        user.object.units['Token'].splice(i, 1);
        console.log("Token removed from board", user.object.units['Token'])
      }else{
        i++;
      }
    })
    allData, message = updatePowerTokens(order.player,1, allData);
  }
  if (order.droptoken){
    //take a power token from user and place it on square
    user.object.units['Token'].push(order.id);
    allData, message = updatePowerTokens(order.player,-1, allData);
  }
  //console.log("before move: user, competitors", user, competitors)
  order.destinations.forEach((dest)=>{
    //for each destination log an attack or move the units. Update the Player once complete.
    let attack = false;
    competitors.forEach((c) => {
      //console.log("before attack", playerOwnsSquare(c,dest[1]), dest[2]);
      if (playerOwnsSquare(c, dest[1])
          && dest[2]){
        allData, message = createAttack(order, dest, user, c, allData);
        attack = true;
      }
    })
    if (!attack){
      let i = 0;
      if (!user){
        [user, competitors] = getUserFromOrder(allData, order);
      }
      while ( i < user.object.units[dest[0]].length){
        if (user.object.units[dest[0]][i] == order.id){
          user.object.units[dest[0]].splice(i,1,dest[1]);//replaces old square with new
          user = OwnedSquares.updateOwnedSquareUnits(user,order.id);
          if (!OwnedSquares.playerOwnsSquare(user,dest[1])){
            user.object.ownedSquares.push(OwnedSquares.newOwnedSquare(dest[1]));
            message = user.id + " takes " + dest[1];
          }
          user = OwnedSquares.updateOwnedSquareUnits(user,dest[1]);
          user = OwnedSquares.updateOwnedSquareOrders(order, allData, false);
        }else{
          i++;
        }
      }

    }
  })
  //console.log("updated?", allData[1][0], allData[1[1]])
  return [allData, message];
}

exports.getPlayerFromOrder = function (allData, order) {
  console.log("getPlayer",allData, order)
    let u = '';
    let c = [];
    allData[1].forEach((player)=>{
      if (player._id.toString() == order.player.toString()){
          u = player;
      }else{
        c.push(player);
      }
    })
    return [u,c];
  }

exports.getPlayerFromSquare = function (allData, square){
  let i = 0;
  allData[1].forEach((player)=>{
    player.object.ownedSquares.forEach((s)=>{
      if (s.id == square){
        return square, i;
      }
    })
    i++;
  })
  return;
}


function createAttack(order, orderDest, attacker, defender, allData){
  allData[0].gameObj.attackList.forEach((attack) =>{
    if (attack.origin == order.id && attack.destination == orderDest[1]){
      attack.attackUnitStrength += (orderDest[0] == 'Footman') ? 1 : (orderDest[0] == 'Kight') ? 2 : (orderDest[0] == 'Siege') ? 4 : (orderDest[0] == 'Ship') ? 1 : 0;
    }
  })
  let ownedSquare = defender.object.ownedSquares[OwnedSquares.getOwnedSquareIndex(defender, orderDest[1])];
  let attack = {
    origin: order.id,
    destination: orderDest[1],
    attackUnitStrength: (orderDest[0] == 'Footman') ? 1 : (orderDest[0] == 'Kight') ? 2 : (orderDest[0] == 'Siege') ? 4 : (orderDest[0] == 'Ship') ? 1 : 0,
    defenseStrength: ownedSquare.totalDefense,
    attackSupport: ownedSquare.ownedSupport,
  }
  console.log("creating attack", attack)
  let message = attacker.id + " attacks " + defender.id + " at " + orderDest[1]
  allData[0].gameObj.attackList.push(attack)
  return [allData, message];
}


function performRaid(raid, orderList, allData){
  //get list of neighboring squares
  let message = '';
  let squares = Utilities.getNeighbors(raid.id);
  //check order list to see if there's a corresponding order for each square
  squares.forEach((s) =>{
    let i = 0;
    orderList.forEach((o) =>{
      if (o.id == s && o.player != raid.player && o.type != 1){
        if (o.type == 4 && raid.star &&
          (raid.preference == 4 || raid.preference == 0)){//Defense
          orderList.splice(i,1);
          OwnedSquares.updateOwnedSquareOrders(o, allData, true);
        }else if (o.type == 5 &&
        (raid.preference == 5 || raid.preference == 0)){ //CP
          allData = updatePowerTokens(o.player,-1, allData);
          allData = updatePowerTokens(raid.player,1, allData);
          orderList.splice(i,1);
        }else if (o.type == 3 &&
          (raid.preference == 3 || raid.preference == 0)){//Raid
          orderList.splice(i,1);
        }else if (o.type == 2 &&
          (raid.preference == 2 || raid.preference == 0)){//Support
          orderList.splice(i,1);
          OwnedSquares.updateOwnedSquareOrders(o, allData, true)
          }
        }
        message = o.player + " raids " + o.name + " from " + o.id
        return [orderList, message];
      })
      i++;
    })
  if (raid.preference != 0){
    raid.preference = 0;
    orderList, allData = performRaid(raid, orderList)
  }
  return [orderList, message];
}

function updatePowerTokens(playerID, num, allData, order){
  //Add to power tokens or add action to queue for player to muster.
  let message = '';
  if (order){
    if (order.star){
      //queue up Muster vs collect choice then subsequent action
    }
  }else{
    allData[1].forEach((player)=>{
      if (player._id == playerID){
        player.object.powerTokens += num;
        message = player.id + " power tokens change " + num;
      }
      console.log("player token update", player.object.powerTokens)
    })
  }
  return [allData, message];
};

exports.updatePlayerSupply = function(player){
  player.object.supply = 0;
  player.object.ownedSquares.forEach((square)=>{
    player.object.supply += getSquareSupply(player, square);
  })
  console.log("supply",player)
  return players;
}

function getSquareSupply(player, square){
  return eval('allData[2].column'+square.id[0][square[1]-1]+'.bonus.match(/S/g || []).length');
}

exports.updatePlayerCastles = function(player){
  player.object.castleList = player.object.strongholdList = []; player.object.totalCastles = 0;
  player.object.ownedSquares.forEach((square)=>{
    let castle = getSquareCastles(square);
    if (castle == 'C' && player.object.castleList.indexOf(square.id) == -1){
        player.object.castleList.push(square.id);
        player.totalCastles += 1;
      }else if (castle == 'S'&& player.object.strongholdList.indexOf(square.id) == -1){
        player.object.strongholdList.push(square.id);
        player.totalCastles += 2;
      }
    })
    console.log("castles",player)
  return player;
}

function getSquareCastles(player, square){
  return eval('allData[2].column'+square.id[0][square[1]-1]+'.castle');
}


exports.seasonCards = function(allData){//Season cards should compile everything for player input and create a list of actions for conditionalActions to complete w/ player input
  let messages = [];
  let message = '';
  allData[0].gameObj.phase = 'endRound';
  [allData, message] = allData[0].gameObj.seasonOne.drawCard()(allData);
  messages.push(message);
  [allData, message] = allData[0].gameObj.seasonsTwo.drawCard()(allData);
  messages.push(message);
  [allData, message] = allData[0].gameObj.seasonsThree.drawCard()(allData);
  messages.push(message);

  return [true, allData, messages];
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
    allData[1].forEach((player) => {
      player.object.orders = [];
      player.object.ownedSquares.forEach((square)=>{
        square.ownedSupport = 0;
        square.enemySupport = 0;
        OwnedSquares.updateOwnedSquareUnits(player, s)
      })
    })
  }else{
    checkEndGame(allData);
  }
  let message = 'Turn '+allData[0].gameObj.turnNum+' starting.'
  return [true, allData, message]
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
  let owned = {};
  let squares = [];
  if (player.object.house == 'Lannister'){
    player.object.units.Footman = ['F5', 'E5'];
    player.object.units.Knight = ['F5'];
    player.object.units.Siege = [];
    player.object.units.Ship = ['G5', 'G6'];
    player.object.units.Token = ['F5']
    squares = ['F5', 'E5', 'G5', 'G6'];
    player.object.attackDeck = new Deck('House-Lannister', 'House');
  }
  if (player.object.house == 'Baratheon'){
    player.object.units.Footman = ['A6', 'C7'];
    player.object.units.Knight = ['A6'];
    player.object.units.Siege = [];
    player.object.units.Ship = ['B6', 'B6'];
    player.object.units.Token = ['C7']
    squares = ['A6', 'B6', 'C7'];
    player.object.attackDeck = new Deck('House-Boratheon', 'House');
  }
  if (player.object.house == 'Stark'){
    player.object.units.Footman = ['E2', 'E2', 'E3','C2'];
    player.object.units.Knight = ['E2'];
    player.object.units.Siege = [];
    player.object.units.Ship = ['B2'];
    player.object.units.Token = ['E2', 'D2']
    squares = ['E2', 'E3', 'C2', 'B2','D2'];
    player.object.attackDeck = new Deck('House-Stark', 'House')
  }
  squares.forEach((s)=>{
    player.object.ownedSquares.push(OwnedSquares.newOwnedSquare(s))
    player = OwnedSquares.updateOwnedSquareUnits(player, s);
  });
  return [player, game];
}


exports.initializeGame = function(players, game){
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

  game.gameObj.seasonOne = new Deck('SeasonOne', 'Season')
  game.gameObj.seasonTwo = new Deck('SeasoneTwo')
  game.gameObj.seasonThree = new Deck('SeasoneThree')

  exports.updateAllSupply()

  return game;
}
