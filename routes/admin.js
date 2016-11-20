var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/model');

router.get('/login', function(req, res, next){
  res.render('admin-login');
})

router.post('/login', function(req, res, next){
  var username =  req.body.username;
  var password = req.body.password;
  console.log(username, password);
  User.findOne({username: username}, function(err, admin){
    if(admin){
      req.session.admin = admin;
      if(admin.checkPassword(password)){
        console.log("Success password!");
        User.find({}, function(err, users){
          if(users){
            res.render('profile', {users:users});
          }
          else if(err) return next(err);
        })
      }
      else if(err){
        return next(err);
      }
      else res.send(403);
    }
    else res.send("Wrong username.");
  })
})



module.exports = router;
