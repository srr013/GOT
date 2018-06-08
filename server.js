let express = require('express');
let app = express();
let http = require('http').Server(app);;
let io = require('socket.io')(http);
let fs = require('fs');

let Game = require('./server/Game.js');
let GameObect = require('./server/GameObject.js');

let savedGamesFilePath = __dirname+"/server/Games/"


//start listening
app.use(express.static('public'));
app.use('/games/*', express.static('public'))
let server = http.listen(process.env.PORT
|| 3000, function(){
  console.log('Server started');
});

let SOCKET_LIST = {};
let PLAYER_LIST = {};
let GAME_LIST = [];

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('user data', GAME_LIST);
  socket.on('disconnect', function(){
      //should check to see if anyone in the room and save the game state to a file if not
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
      console.log("message sent")
      io.emit('chat message',msg);
  });
    socket.on('new game', () => {
      let gameid = GAME_LIST.length;
      let game = createGame(gameid);
      GAME_LIST[gameid] = game;
      console.log("gamelist", GAME_LIST);
      socket.emit('open game', game);
      });
  socket.on('load game', (gameid) => {
      console.log("loading game");
      //Should check HTTP request for gameID and check the game list for that ID. If not there then load game from file, add to game list, and deliver the game object
      let game = GAME_LIST[gameid];
      var nsp = io.of('/Games/'+ game.gameid);//create namespace for this game
      socket.emit('open game', game);
    });
        //This could be problematic because it takes the object data from the client instead of calculating it itself. Should likely just get the object ID and changes from the client and maintain the squares on the server.
        socket.on('object update', (object) => {
            console.log("server object update", object);
        GAME_LIST[object.gameid][object.index] = object;
        socket.emit('object update', object);
        console.log(GAME_LIST);
    });
});

createGame = (gameid) => {
  let gameObj = new GameObject(gameid); //game variables and data
  let game = new Game(gameObj,3,10); //gameplay and turn progression
  console.log("game object created", game);
  return game;
}

let shutdown = function(){
  console.log("shutting down")
  saveGames();
  server.close()
}

let saveGames = function(){
  console.log("in saveGame", GAME_LIST);
  GAME_LIST.forEach((game) =>{
      fs.writeFile(savedGamesFilePath+game.gameId+'.txt', JSON.stringify(game), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("File saved");
    });
  });
};


//Run on server start to load saved games
let start = function(){
  fs.readdir(savedGamesFilePath, function( err, files ) {
        if( err ) {
            console.error( "Could not list the directory.", err );
            process.exit( 1 );
        } else{
        files.forEach( function( file, index ) {
          let name = file.replace('.txt','');
          fs.readFile(savedGamesFilePath+file, 'utf8', function (err,data) {
              if (err) {
                return console.log(err);
              }
              GAME_LIST[name] = JSON.parse(data);
            });
        });
      }
    });
  };
start();

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
