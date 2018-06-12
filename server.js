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

let Game = require('./server/Game.js');
let GameObject = require('./server/GameObject.js');
let GameFuncs = require('./server/GameFunctions.js');

let savedGamesFilePath = __dirname+"/server/Games/"

//connect to MongoDB
const User = require('./models/User.js');
mongoose.connect('mongodb://localhost/testForAuth');
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("db connected");
});
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

function validPassword(pw){
  return true;
}
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      console.log(user);
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//       User.findOne({
//         username: username
//       }, function(err, user) {
//         if (err) {
//           return done(err);
//         }
//
//         if (!user) {
//           return done(null, false);
//         }
//         console.log(password, user.password);
//         bcrypt.compare(password,user.password).then(function (result){
//           if(result == true){
//             return done(null, user);
//           }else{
//             return done(null, false);
//           }
//         })
//       });
//   }
// ));
// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("req?", req);
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

let USER_LIST = [];
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
    // socket.on('login', (req) => {
      // let i = 0;
      // while (i < USER_LIST){
      //   if (USER_LIST[i].authcode == user.authcode){
      //     io.emit('userIndex', i)
      //     return
      //   }
      // }
      // user.index = USER_LIST.length;
      // USER_LIST.push(user);
      // io.emit('userIndex', user.index);
    //})
    socket.on('new game', (userIndex) => {
      let gameid = Math.round(Math.random()*100000000000);
      let game = createGame(gameid, USER_LIST[userIndex]);
      GAME_LIST[gameid] = game;
      socket.emit('open game', game);
      });
  socket.on('load game', (gameid, userIndex) => {
      console.log("loading game");
      //Should check HTTP request for gameID and check the game list for that ID. If not there then load game from file, add to game list, and deliver the game object
      let game = GAME_LIST[gameid];
      var nsp = io.of('/Games/'+ game.gameid);//create namespace for this game
      socket.emit('open game', game);
  socket.on('join game', (gameid, USER_LIST[userIndex]))
    });
        //This could be problematic because it takes the object data from the client instead of calculating it itself. Should likely just get the object ID and changes from the client and maintain the squares on the server.
    socket.on('object update', (object) => {
        console.log("server object update", object);
        GAME_LIST[object.gameid][object.index] = object;
        socket.emit('object update', object);
        console.log(GAME_LIST);
    });
    socket.on('submit turn', (object) => {
      //let game = GAME_LIST[object.gameObj.gameId];
      if (object.gameObj.gameVariables.phase == 'start'){
        let game = GameFuncs.stepThrough(object);
        socket.emit('object update', game);
      }
    });
});

createGame = (gameid, userIndex) => {
  let gameObj = new GameObject(gameid); //game variables and data
  let game = new Game(gameObj,3,10); //gameplay and turn progression
  GameFuncs.addPlayer(USER_LIST[userIndex], game);
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
            return console.log("error loading", err);
        }
      });
        console.log("File saved");
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
          console.log(name);
          fs.readFile(savedGamesFilePath+file, 'utf8', function (err,data) {
              if (err) {
                return console.log(err);
              }
              console.log(data);
              GAME_LIST[name] = JSON.parse(data);
            });
        });
      }
    });
  };
start();

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
