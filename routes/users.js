var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
mongoose.Promise = global.Promise;
var db = mongoose.connect('mongodb://localhost/mydb');

var User = require('../models/model');
var Composition = require('../models/composition');
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
			if(user.checkPassword(password)){
				console.log("Success password!");
				if(user.role === 'user'){
					req.session.user = user;
					Composition.find({author:user._id}, function(err, stories){
						if(err) return next(err);
						if(stories){
							res.render('profile', {user: user, stories: stories});
						}
					});

				}

				else if(user.role === 'admin'){
					req.session.admin = user;
					User.find({}, function(err, users){
				  if(users){
				 		res.render('usersList', {users: users});
					}
				    else if(err) return next(err);
		      });
				}
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
	if (req.session.user || req.session.admin) {
		delete req.session.user;
		res.redirect('/');
	}
});
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/profile/:username', function(req, res, next){
			var username = req.params.username;
			 User.findOne({username:username}, function(err, user){
				if(err) return next(err);
				if(!user) return res.send(404);
				if(user){
				 	Composition.find({author: user._id}, function(err, stories){
					if(err) return next(err);
					if(!stories) return res.send(404);
					else{
						res.render('profile', {user: user, stories: stories});
					}
				});
				}
			});
});

router.post('/:id/delete', function(req, res, next){
	if(req.session.user || req.session.admin){
		var id = req.params.id;
		console.log(id);
		User.findById(id, function(err, user){
			if(err) return next(err);
			if(!user) return res.send(404);
			else{
				user.remove(function(err){
	        if(err) return next(err);
	        else res.send(200);
	      });
			}
		});
	}

});

module.exports = router;
