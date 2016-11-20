var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
mongoose.Promise = global.Promise;
var db = mongoose.connect('mongodb://localhost/mydb');

var User = require('../models/model');
//>>>>>>> АВТОРИЗАЦИЯ<<<<<<<<<<<<<
router.post('/signin', function(req, res, next){
	var username = req.body.username;
	var password = req.body.password;
	var role = 'user';
	User.findOne({username: username}, function(err, user){
		if(user){
			if(user.checkUsername(username)){
				console.log("This username is exist.");
				return res.send(403);
			}
		}
	});
	var user = new User({username: username, password: password, role: role});
	user.save(function(err){
		if(err) return next(err);
		else{
			req.session.user = user;//{id: user._id, name: user.username}
			res.render('profile', {user: req.session.user});
		}
	})
})

router.post('/login', function(req, res, next){
	var username =  req.body.username;
	var password = req.body.password;
	console.log(username, password);
	User.findOne({username: username}, function(err, user){
		if(user){
			if(user.role === 'user')
				req.session.user = user;//{id: user._id, name: user.name}
			 else if(user.role === 'admin')
			 	req.session.admin = user;
			if(user.checkPassword(password)){
				console.log("Success password!");
				if(user.role === 'user')
					res.render('profile', {user: user});
				else if(user.role === 'admin')
					res.render('userslist', {admin: user});
			}
			else if(err){
				return next(err);
			}
			else res.send(403);
		}
		else res.send("username doesn't exist.");
	})
})

router.get('/logout', function(req, res, next) {
	if (req.session.user) {
		delete req.session.user;
		res.redirect('/');
	}
});
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/profile/:username', function(req, res, next){
		if (req.session.user){
			var user = req.session.user;
			res.render('profile', {user: user});
		}
		else{
			let username = req.params.username;
			User.findOne({username:username}, function(err, user){
				if(err) return next(err);
				if(user){
					res.render('profile', {user: user});
				}
			});
		}
})

router.get('/profile', function(req, res, next){
		res.render('profile', {title:'Profile'});
})

module.exports = router;
