let SquareBuilder = require('./SquareBuilder.js');
let express = require('express');
let app = express();
let http = require('http').Server(app);
app.use(express.static('public'));
let io = require('socket.io')(http);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(process.env.PORT 
|| 3000, function(){
  console.log('Server started');
});

let SOCKET_LIST = {};
let PLAYER_LIST = {};
let GAME_LIST = [];

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
    socket.on('new game', function(){
        console.log("starting new game");
        let map = SquareBuilder.loadFile();
        GAME_LIST.push(map); //push to a specific index based on game ID
        socket.emit('new map', map);
        });
    socket.on('load game', function(){
        console.log("loading game");
        //Should check HTTP request for gameID and check the game list for that ID. If not there then load game from file, add to game list, and deliver the game object
        let map = GAME_LIST[0];
        socket.emit('new map', map);
        //now try and update map, save it to Game_List, then see if you can load that.
    });
        //This is problematic because it takes data from the client instead of calculating it itself
        socket.on('object update', (object) => {
            console.log("server object update", object);
        GAME_LIST[0][object.index] = object;
        socket.emit('object update', object);
    });
});