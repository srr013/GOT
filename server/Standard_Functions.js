'use strict';
let Utilities = require('./Utilities.js');
let Deck = require('./Deck.js');
let Player = require('./GOT/Player.js');
let GameFunctions = require('./GOT/GameFunctions.js');

let GameModel = require('../models/Game.js');
let PlayerModel = require('../models/PlayerModel.js');
let MapModel = require('../models/MapModel.js');

//Runs the first function it finds that is false at [1]
exports.stepThrough = function(game){
  let round = game.game;//Need to figure out how to dupe each round into game when a round is complete.
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

exports.getPlayerFromUser = function(userid, gameid){
  let p = new Promise(function(resolve, reject){
    let result = PlayerModel.findOne({$and: [{user:userid},{gameid:gameid}]}).exec();
    if(result){
      //console.log("pull from playerModel", result);
      resolve(result);
    }else{
      reject('Failure: Player not found');
    }
  })
  return p;
};

exports.getMapData = function(gameid){
  let m = new Promise(function(resolve, reject){
    let result = MapModel.findOne({gameid:gameid}).exec();
    if(result){
      //console.log("pull from playerModel", result);
      resolve(result);
    }else{
      reject('Failure: Player not found');
    }
  })
  return m;
};

exports.addPlayer = function(user, gameRounds, gameObj, players){
  console.log("adding player from Standard Functions", gameRounds, user, players, gameObj);
  if (players.length < gameRounds.numPlayers){
    if (gameObj.phase == 'start'){
      new Player(gameRounds, user, cb, players, gameObj);
    }
  }else{
    console.log("game full");
  }
};
function cb(players, player, gameRounds, gameObj, user){
  //console.log("cb beginning", players, player, user);
  if (players.indexOf(player) == -1){
    players.push(user);
  };
  GameModel.findOneAndUpdate(
    {_id:gameRounds.id},
    {players:players}, function(error,success) {
      if (error){
        console.log("error", error);
      }else{
        //console.log("success", success);
      }
    }
  )
  //console.log("game.gameObj?", players, gameObj);
  if (players.length == gameRounds.numPlayers){
    players = Utilities.shuffle(players);
    let index = 0;
    if (gameObj.houses.length == 0){
      this.getHouses(gameObj);
    }
    players.forEach((userid) => {
      let p = exports.getPlayerFromUser(userid, gameRounds.id)
      .then((result) => {
        //console.log(result);
        if (!result.house){
          result = GameFunctions.initializePlayer(result, gameObj);
        }else{
          console.log("user already assigned")
        }
      })
      .catch((error) =>{
        console.log("error caught", error);
      })
    });
    return true;
  }else{
    return false;
  }
};


function playersReady(game){ //Need a function on server that updates the gameobj.players.orders with player's moves when they emit a 'orders complete' status. This orders list should be sorted first to last: raid orders = 1,2,3, move orders = 4,5,6, consolidate power = 7,8,9. Ideally with gaps.
 let ready = true;
 game.gameObj.players.forEach((player) => {
   if(player.ready == false){
     ready = false;
   }
 return ready;
 });
};
