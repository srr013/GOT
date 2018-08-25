var mongoose = require('mongoose');

var MapSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  columnA: {
    type: Array,
    unique: false,
  },
  columnB: {
    type: Array,
    unique: false,
  },
  columnC: {
    type: Array,
    unique: false,
  },
  columnD: {
    type: Array,
    unique: false,
  },
  columnE: {
    type: Array,
    unique: false,
  },
  columnF: {
    type: Array,
    unique: false,
  },
  columnG: {
    type: Array,
    unique: false,
  },
  columnH: {
    type: Array,
    unique: false,
  },
  columnI: {
    type: Array,
    unique: false,
  },
  columnJ: {
    type: Array,
    unique: false,
  },
});


var MapModel = mongoose.model('MapModel', MapSchema, 'MapModel');
module.exports = MapModel;
