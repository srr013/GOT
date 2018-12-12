var mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  gameRounds: {
    type: Object,
    required: true
  },
  gameObj: {
    type: Object,
    required: true
  },
  gameMap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MapModel',
  },
  players: {
    type: Object,
    required: false,
  },
  messages: {
    type: Object,
    required: false,
  }
});


var Game = mongoose.model('Game', GameSchema, 'Game');
module.exports = Game;
