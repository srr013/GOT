'use strict';
let Utilities = require('./Utilities.js');
let Deck = require('./Deck.js');
let Player = require('./GOT/Player.js');
let GameFunctions = require('./GOT/GameFunctions.js');

let GameModel = require('../models/Game.js');
let PlayerModel = require('../models/PlayerModel.js');
let MapModel = require('../models/MapModel.js');

//Runs the first function it finds that is false at [1]
exports.stepThrough = function(gameid,index,allData){
  let i = (index == undefined) ? 0 : index;
  if (allData == undefined){
    let gameData = exports.getAllData(gameid)
    .then((results)=>{
        step(results);
      })
  }else{
    allData = step(allData);
  }
}

function step(alldata){
  let i=0;
  //console.log("round?", alldata)
  let round = alldata[0].gameRounds.currentRound;
  while (round[i][1] == true){
    i++;
  };
  let roundResult = eval('GameFunctions.'+round[i][0]+'(alldata)');
  //console.log(round,i);
  if (roundResult[0]){
    roundResult[1][0].gameRounds.currentRound[i][1] = round[i][1] = true;
    ++i;
    exports.stepThrough(roundResult[1][0]._id,i,alldata);
  }else{
    alldata[1].forEach((player)=>{
      PlayerModel.update({_id:player._id},{'object': player.object}).exec();
    })
    GameModel.update({_id:alldata[0]._id},{'gameObj': roundResult[1][0].gameObj}).exec();
    GameModel.update({_id:alldata[0]._id},{$set: {'gameRounds.currentRound': alldata[0].gameRounds.currentRound}}).exec();
    console.log("steps complete");
  }
}

// exports.updateDB = function(Model,identifier,change){
//   let save = new Promise(function(resolve,reject){
//     console.log(Model+'.update('+identifier+','+change+').exec()')
//     let result = eval(Model+'.update('+identifier+','+change+').exec()');
//     if (result){
//       resolve(result);
//     }else{
//       reject(error);
//     }
//   })
//   .then((result)=>{
//     console.log(result);
//   })
//   .catch((error)=>{
//     console.log('Error saving to DB', error);
//   })
//   return save;
// }

exports.getAllData = function(gameid){
  let game = new Promise(function(resolve, reject){
    let result = GameModel.findOne({_id:gameid}).exec();
    if(result){
      resolve(result);
    }else{
      reject('Failure');
    }
  });
  let players = new Promise(function(resolve, reject){
    let result = PlayerModel.find({gameid:gameid}).exec();
    if(result){
      resolve(result);
    }else{
      reject('Failure');
    }
  });
  let map = new Promise(function(resolve, reject){
    let result = MapModel.findOne({_id:gameid}).exec();
    if(result){
      resolve(result);
    }else{
      reject('Failure');
    }
  });
  let p = Promise.all([game,players,map])
  .then(function(results){
    return results;
  }).catch(function(err){
    console.log(error);
  })
  return p;
};

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
exports.getAllPlayersData = function(gameid){
  let players = new Promise(function(resolve, reject){
    let result = PlayerModel.find({gameid:gameid}).exec();
    if(result){
      resolve(result);
    }else{
      reject('Failure');
    }
  })
  return players;
};

exports.getSinglePlayerData = function(playerID){
  let player = new Promise(function(resolve, reject){
    let result = PlayerModel.findOne({_id:playerID}).exec();
    if(result){
      resolve(result);
    }else{
      reject('Failure');
    }
  })
  return player;
};

exports.getGameData = function(gameid){
  let game = new Promise(function(resolve, reject){
    let result = GameModel.find({gameid:gameid}).exec();
    if(result){
      resolve(result);
    }else{
      reject('Failure');
    }
  })
  return game;
};

exports.updatePlayerObject = function(player){
  //not a Promise
  PlayerModel.update(
    {_id:player._id},
    {object:player.object},
    function(error,success) {
      if (error){
        console.log("error", error);
      }else{
        console.log("success saving player object", success);
      }}
  )
}

exports.addPlayer = function(user, game){
  console.log("adding player from Standard Functions", game);
  if (game.players.length < game.gameRounds.numPlayers){
    if (game.gameObj.phase == 'start'){
      return new Player(game, user);
    }
  }else{
    console.log("game full");
  }
};

exports.startGame = function(game){
    console.log("starting Game", game)
    let players = exports.getAllPlayersData(game.id).then((result)=>{
      players = Utilities.shuffle(result);
      let index = 0;
      if (game.gameObj.houses.length == 0){
        GameFunctions.getHouses(game);
      }
      //console.log(players);
      players.forEach((player) => {
        if (!player.object.house){
          GameFunctions.initializePlayer(player, game);
        }else{
          console.log("user already assigned")
        }
      })
      GameFunctions.initializeTracks(players, game);
    })
      .catch((error) =>{
          console.log("error caught", error);
      })
  };
