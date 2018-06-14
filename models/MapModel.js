var mongoose = require('mongoose');

var MapSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  column1: {
    type: Array,
    unique: false,
  },
  column2: {
    type: Array,
    unique: false,
  },
  column3: {
    type: Array,
    unique: false,
  },
  column4: {
    type: Array,
    unique: false,
  },
  column5: {
    type: Array,
    unique: false,
  },
  column6: {
    type: Array,
    unique: false,
  },
  column7: {
    type: Array,
    unique: false,
  },
  column8: {
    type: Array,
    unique: false,
  },
  column9: {
    type: Array,
    unique: false,
  },
  column10: {
    type: Array,
    unique: false,
  },
});


var MapModel = mongoose.model('MapModel', MapSchema, 'MapModel');
module.exports = MapModel;
