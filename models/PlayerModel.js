var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema({
  object: {
    type: Object,
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  gameid: {
    type: String,
  }
});


var Player = mongoose.model('Player', PlayerSchema, 'Player');
module.exports = Player;
