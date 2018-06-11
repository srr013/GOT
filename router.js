let express = require('express');
let router = express.Router();
let User = require('./models/User.js');
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy;


router.get('/register', function (req, res, next) {
  //console.log("get/", req)
  return res.sendFile(__dirname+'/public/register.html');
});

//GET route to set user on client
router.get('/api/user_data', function(req, res) {
            if (req.session.passport.user === undefined) {
                // The user is not logged in
                res.json({});
            } else {
                res.json({
                    userid: req.session.passport.user
                });
            }
        });

//POST route for updating data
router.post('/register', function (req, res, next) {
  // confirm that user typed same password twice
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
          passwordConf: req.body.passwordConf,
        }

        User.create(userData, function (error, user) {
          if (error) {
            return next(error);
          } else {
            req.session.userId = user._id;
            console.log("user created",user._id);
            return res.redirect('/');
          }
        });
      }
    }
  });
  router.post('/',
      passport.authenticate('local',{failureRedirect: '/#failure', successRedirect: '/#success'}));
//
//   } else if (req.body.logemail && req.body.logpassword) {
//     User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
//       if (error || !user) {
//         var err = new Error('Wrong email or password.');
//         err.status = 401;
//         return next(err);
//       } else {
//         console.log("success");
//         req.session.userId = user._id;
//         return res.redirect('/#success');
//       }
//     });
//   } else {
//     var err = new Error('All fields required.');
//     err.status = 400;
//     return next(err);
//   }
// })

//GET route after registering
// router.get('/games/*', function (req, res, next) {
//   console.log(req);
//   User.findById(req.session.userId)
//     .exec(function (error, user) {
//       if (error) {
//         return next(error);
//       } else {
//         if (user === null) {
//           var err = new Error('Not authorized! Go back!');
//           err.status = 400;
//           return next(err);
//         } else {
//           return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
//         }
//       }
//     });
// });

// GET for logout logout
router.get('/logout', function (req, res, next) {
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

module.exports = router;
