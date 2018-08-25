let express = require('express');
let app = express();
let http = require('http').Server(app);;
let io = require('socket.io')(http);
let fs = require('fs');
let bodyParser = require('body-parser');
let passport = require('passport')
app.use(passport.initialize());
app.use(passport.session());
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let routes = require('./router.js');
var bcrypt = require('bcrypt-nodejs');

let Game = require('./server/GOT/Round.js');
let GameObject = require('./server/GOT/GameObject.js');
let GameFuncs = require('./server/GOT/GameFunctions.js');
let StandardFuncs = require('./server/Standard_Functions.js');
let GameMap = require('./server/Map.js');
let database = require('./DatabaseInteractions.js');

// //connect to MongoDB
// const UserModel = require('./models/User.js');
// const GameModel = require('./models/Game.js');
// const MapModel = require('./models/MapModel.js')
// const PlayerModel = require('./models/PlayerModel.js');
mongoose.connect('mongodb://localhost/testForAuth');
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("db connected");
});
let GameModel = require('./models/Game.js');
let MapModel = require('./models/MapModel.js')
let PlayerModel = require('./models/PlayerModel.js');
let UserModel = require('./models/User.js');

//use sessions for tracking logins
app.use(session({
  secret: 'playgamesonline',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  }),
}));
// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routes);
app.use(express.static('public'));
app.use('/games/*', express.static('public'))


let LocalStrategy = require('passport-local').Strategy;

function validPassword(pw, user,cb){
  bcrypt.compare(pw, user.password, function (err, result) {
    console.log("result", result);
    if (result === true) {
      return cb(null,user);
    } else {
      return cb();
    }
  });
}
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log("login deets", username, password)
    let query = UserModel.where({email:username});
    query.findOne(function (err, user) {
      if (err) { return done(err); }
      console.log("passport", err, user);
      if (!user) {
        return done(null, false);
      }
      if (!validPassword(password, user, done)) {
        return done(null, user); // bypassing PW check for now
      }
      return done(null, user);
    });
  }
));
//example User:
// { _id: 5b1e8ce9b6ba66453161b7da,
//   email: 'sfdkn@mkfln',
//   username: 'srr013@bucknell.edu',
//   password:
//    '$2b$10$PoiVSn8NpTTZ4KqEwG7bueOrTOdWQ.ptudgJl1IWXKOwEqIWtEjmm',
//   passwordConf: '1234',
//   __v: 0 }

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    database.User.findById(id, function(err, user) {
        done(err, user);
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});
//start listening
let server = http.listen(process.env.PORT
|| 3000, function(){
  console.log('Server started');
});



io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
      //should check to see if anyone in the room and save the game state to a file if not
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
      console.log("message sent")
      io.emit('chat message',msg);
  });
    socket.on('game list', (userid) =>{
      let games = GameModel.findOne({userid:userid}, function(err, game){
        console.log(game);
        if (err) { return err; }
        else {
          return (null, game);
        }
      })
    }

  )
    socket.on('new game', (user) => {
      let gameid = Math.round(Math.random()*100000000000);
      let cb = function(newgame){
        socket.emit('open game', newgame);
      };
      createGame(gameid, user, cb);
    })

function openGame(gameID){
    let g = new Promise(function(resolve, reject){
      let res = GameModel.findOne({_id:gameID}).exec();
      if(res){
        resolve(res);
      }else{
        reject('Failure');
      }
    }).then((res) => {
      console.log("data to client", res);
      socket.emit('open game', res);
    }).catch((error) => {
      console.log("Error", error);
    })
  };
  socket.on('open game', ([USERDATA, gameID]) => {
    //New player joining existing game
    console.log(USERDATA,gameID);
    let game = new Promise(function(resolve, reject){
      let result = GameModel.findOne({_id:gameID}).exec();
      if(result){
        resolve(result);
      }else{
        reject('Failure');
      }
    })
    .then((result) => {
      console.log("Adding Player", result);
      if (result.players.indexOf(USERDATA.userid) == -1){
        StandardFuncs.addPlayer(USERDATA.userid, result.gameRounds,result.gameObj,result.players)
        //openGame()
      }else{
        console.log("user already in game")
        //redirect to the game
      }
    })
    .catch((error) => {
      console.log("Error", error);
    })
    .then(() => {
      let g = new Promise(function(resolve, reject){
        let res = GameModel.findOne({_id:gameID}).exec();
        if(res){
          resolve(res);
        }else{
          reject('Failure');
        }
      }).then((res) => {
        console.log("data to client", res);
        socket.emit('open game', res);
      }).catch((error) => {
        console.log("Error", error);
      })
    })
  });

  socket.on('load game', (USERDATA) => {
      let playerData = [];
      //console.log("loading game!", USERDATA.gameid, USERDATA.userid);
      let game = new Promise(function(resolve, reject){
        let result = GameModel.findOne({_id:USERDATA.gameid}).exec();
        if(result){
          resolve(result);
        }else{
          reject('Failure');
        }
      });
      let players = new Promise(function(resolve, reject){
        let result = PlayerModel.find({gameid:USERDATA.gameid}).exec();
        if(result){
          resolve(result);
        }else{
          reject('Failure');
        }
      });
      let map = new Promise(function(resolve, reject){
        let result = MapModel.findOne({_id:USERDATA.gameid}).exec();
        if(result){
          resolve(result);
        }else{
          reject('Failure');
        }
      });
      Promise.all([game,players,map])
      .then(function(results){
        console.log("full game data :)", results);
        var nsp = io.of('/games/'+ game.gameid);//create namespace for this game
        socket.emit('load game', results);
      }).catch(function(err){
        console.log(error);
      })
    });

    socket.on('object update', (object) => {
        console.log("server object update", object);
        //GAME_LIST[object.gameid][object.index] = object;
        //store it to the DB
        socket.emit('object update', object);
        console.log(GAME_LIST);
    });
    socket.on('submit turn', (object) => {
      console.log("turn submitted", object);
      //let game = GAME_LIST[object.gameObj.gameId];
      //Store the object to the DB/rectify the changes w/ DB




      if (object.gameObj.gameVariables.phase == 'start'){
        let gameObj = GameFuncs.stepThrough(object);
        socket.emit('object update', gameObj);
      }
    });
});

function createGame(gameid, user, cb){
  GameModel.findById(gameid, function(err,game){
    if (!game){
      console.log("creating game");
      let gameObj = new GameObject(gameid); //game variables and data
      let gameRounds = new Game(gameid,2,10); //gameplay and turn progression
      let map = GameMap.loadMapFromFile();
      let players = []
      StandardFuncs.addPlayer(user, gameRounds, gameObj, players);

      gameModel = new GameModel({
        _id: gameid,
        gameRounds: gameRounds,
        gameObj:gameObj,
        players:[user]
      });
      let mapData = {};
      (function(){
        let i = 0;
        let letters = ['A','B','C','D','E','F','G','H','I','J'];
        while (i < map.length){
          mapData['column'+letters[i]] = map[i];
          i++;
          }
        })();
      let mapModel = new MapModel(mapData);
      mapModel._id = gameModel._id;
      mapModel.save(function(err){
        if(err) console.log("error from MapModel",err);
      });
      gameModel.gameMap = mapModel;
      gameModel.save(function(err, g){
        if (err) console.log("error from gameModel",err);
        cb(g);
      });
    }else{
      gameid++;
      createGame(gameid, user, cb);
    };
  });
};


// let shutdown = function(){
//   console.log("shutting down")
//   saveGames();
//   server.close()
// }
//
// let saveGames = function(){
//   console.log("in saveGame", GAME_LIST);
//   GAME_LIST.forEach((game) =>{
//       fs.writeFile(savedGamesFilePath+game.gameId+'.txt', JSON.stringify(game), function(err) {
//         if(err) {
//             return console.log("error loading", err);
//         }
//       });
//         console.log("File saved");
//     });
//   };


// //Run on server start to load saved games
// let start = function(){
//   fs.readdir(savedGamesFilePath, function( err, files ) {
//         if( err ) {
//             console.error( "Could not list the directory.", err );
//             process.exit( 1 );
//         } else{
//         files.forEach( function( file, index ) {
//           let name = file.replace('.txt','');
//           console.log(name);
//           fs.readFile(savedGamesFilePath+file, 'utf8', function (err,data) {
//               if (err) {
//                 return console.log(err);
//               }
//               console.log(data);
//               GAME_LIST[name] = JSON.parse(data);
//             });
//         });
//       }
//     });
//   };
// start();
//
// process.on('SIGTERM', shutdown);
// process.on('SIGINT', shutdown);
