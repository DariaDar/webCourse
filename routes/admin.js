var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/model');

router.get('/userslist', function(req, res, next){
	var user = req.session.user;
	if(!user) res.send(404);
	if(user.role == 'admin'){
		User.find({ username: { $not: { $in: "Admin" } } } , function(err, users){
			if(err) return next(err);
			if(users){
				res.render('usersList', {users: users, user: req.session.user});
			}
			else{
				res.send(404);
			}
		})
	}
	else{
		res.send(404);
	}
})

module.exports = router;
