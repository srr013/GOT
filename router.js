let express = require('express');
let router = express.Router();
let User = require('./models/User.js');
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy;
const PlayerModel = require('./models/PlayerModel.js');
let mongoose = require('mongoose');

router.get('/register', function (req, res, next) {
  //console.log("get/", req)
  return res.sendFile(__dirname+'/public/register.html');
});

//GET route to set user on client
router.get('/api/user_data', function(req, res) {
  console.log(req.session.passport);
    if (req.session.passport === undefined) {
        // The user is not logged in
        res.json({});
    } else {
      let query = PlayerModel.where({ user: req.session.passport.user });
      query.find(function(err,players){
        console.log("fetching user's game data", err,players);
        if (err) console.log(err);
        if (players){
          let list = [];
          players.forEach((player) => {
            list.push(player.gameid);
          })
          res.json({
              userid: req.session.passport.user,
              games: list,
          });
        }
      })
    }
});

router.get('/logout', function(req, res){
  console.log("logging out");
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.post('/',
    passport.authenticate('local',{failureRedirect: '/#failure', successRedirect: '/#success'}));

//POST route for updating data
router.post('/register', function (req, res, next) {
  // confirm that user typed same password twice
  console.log("posted to register", req.body);
  if (req.body.email){
    if (req.body.password !== req.body.passwordConf) {
      var err = new Error('Passwords do not match.');
      err.status = 400;
      res.send("passwords dont match");
      return next(err);
    }

    if (req.body.email &&
      req.body.username &&
      req.body.password &&
      req.body.passwordConf) {

        var userData = {
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
        }

        user = new User(userData)
        console.log(user);
        user.save(function(error, u){
          console.log(error, u);
          if (error) {
            return next(error);
          } else {
            req.session.userId = u._id;
            console.log("user created",u._id);
            return res.redirect('/');
          }
        });
      }
    }
  });

module.exports = router;
