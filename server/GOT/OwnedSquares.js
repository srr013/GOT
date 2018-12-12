'use strict';
let StandardFunctions = require('../GOT/GameFunctions.js');

exports.playerOwnsSquare = function (player,squareID){
  let owned = false;
  player.object.ownedSquares.forEach((s)=>{
    //console.log("ownsSquare", s.id, squareID);
    if (s.id == squareID){
      console.log("here");
      owned = true;
    }
  })
  return owned;
}
exports.getOwnedSquareIndex = function (player, squareID){
  let i = 0;
  player.object.ownedSquares.forEach((s) =>{
    if (s.id == squareID){
      return i;
    }else{
      i++;
    }
  })
  return i;
}

exports.newOwnedSquare = function (squareID){
  return {
      id:squareID,
      ownedSupport:0,
      enemySupport:0,
      unitDefense:0,
      orderDefense:0,
      totalDefense:0,
      }
}

exports.updateOwnedSquareUnits = function (player, squareID){
  let ownedSquareIndex = exports.getOwnedSquareIndex(player, squareID);
  //console.log("OSI", squareID, ownedSquareIndex, player.object.ownedSquares)
  let square = player.object.ownedSquares[ownedSquareIndex]
  square.unitDefense = 0;
  square.totalDefense = 0;
  let unitDefense = 0;
  let squareOccupied = false;
  for (let property in player.object.units) {
    if (player.object.units.hasOwnProperty(property) && property != 'Token') {
        player.object.units[property].forEach((p)=>{
          if (p == squareID){
            squareOccupied = true;
            (property == 'Footman') ? ++unitDefense : (property == 'Knight') ? unitDefense = unitDefense + 2 : (property == 'Ship') ? ++unitDefense : null; //update unitDefense
            //console.log("updatingOwnedSquare", property, unitDefense);
            square.unitDefense += unitDefense;
            square.totalDefense += unitDefense
          }
        })
      }else if (player.object.units.hasOwnProperty(property) && property == 'Token'){
        player.object.units['Token'].forEach((t)=>{
          if (t == squareID){
            squareOccupied = true;
          }
        })
      }
    }
    //if the square has no units or tokens on it then remove from ownedSquares
    if (!squareOccupied){
      player.object.ownedSquares.splice(ownedSquareIndex,1);
    }
    console.log("Owned Square Update", player.object.ownedSquares)
    return player;
}
exports.updateOwnedSquareOrders = function(order, allData, remove){
  let [user, competitors] = GameFunctions.getPlayerFromOrder(allData, order);
  let ownedSquareIndex = exports.getOwnedSquareIndex(user, order.id);
  let square = player.object.ownedSquares[ownedSquareIndex];
  let num = 1;
  if (order.name == 'Support'){
    //update neighboring squares
    let neighbors = Utilities.getNeighbors(order.id);
    neighbors.forEach((n) =>{
      let player, playerIndex = GameFunctions.getPlayerFromSquare(allData, n);
      if(player){
        let nSquareIndex = exports.getOwnedSquareIndex(player, n);
        let nSquare = player.object.ownedSquares[nSquareIndex];
        (remove) ? num = -1 : null;
        (order.star) ? num = num*2 : null;
        (user._id == player._id) ? nSquare.ownedSupport += num : nSquare.enemySupport += num;
        allData[1][playerIndex] = player;
      }
    }
  )} else if (order.name == 'Defense'){
    (remove) ? num = -1 : null;
    (order.star) ? num = num*2 : null;
    square.orderDefense = num;
    }
  return allData;
}
