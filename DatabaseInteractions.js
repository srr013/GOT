'use strict'
let mongoose = require('mongoose');

let UserModel = require('./models/User.js');
let GameModel = require('./models/Game.js');
let MapModel = require('./models/MapModel.js')
let PlayerModel = require('./models/PlayerModel.js');

let _return = function(result){
  console.log("returning", result);
  return result;
}

let _findOne = function(db, key, value){
  let res = null;
  let query = eval(db+'.where({'+key+': '+value+'})');
  query.findOne(function(err, result){
    if (err) console.log("Error in _findOne", err);
    console.log("Result from DB", result);
    res = result;
  }).then(_return(res));
}

let _findAll = function(db, key, value){
  let res = null;
  let query = eval(db+'.where({'+key+': '+value+'})');
  query.find(function(err, result){
    // if (err) console.log("Error in _findOne", err);
    // console.log("Result from DB findAll", result);
    res = result;
  }).then(_return(res));
}

let promise = function(db, key, value){
  let query = eval(db+'.findOne'+'({'+key+': '+value+'})')
  let promise = query.exec();
  promise.then(function(e){
    console.log("e", e);
    return e;
  })
  }


module.exports = { UserModel,GameModel,MapModel,PlayerModel, _findOne, _findAll, promise}
