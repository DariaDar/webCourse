var express = require('express');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var router = express.Router();
mongoose.Promise = global.Promise;
var db = mongoose.connect('mongodb://localhost/mydb');

var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

var User = require('../models/model');
var Composition = require('../models/composition');

//>>>>>>> АВТОРИЗАЦИЯ<<<<<<<<<<<<<
router.post('/signin',csrfProtection, function(req, res, next){
	let username = req.body.username;
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
			return res.redirect('/users/profile/' + user._id);//res.render('profile', {user: req.session.user, stories: null});
		}
	});
});

router.post('/login', csrfProtection,function(req, res, next){
	var username =  req.body.username;
	var password = req.body.password;
	console.log(username, password);
	User.findOne({username: username}, function(err, user){
		if(user){
			if(user.checkPassword(password)){
				req.session.user = user;
				console.log("Success password!");
				if(user.role === 'user'){

					res.redirect('/users/profile/' + user._id);
				}

				else if(user.role === 'admin'){
					//req.session.admin = user;
				//	res.redirect('/admin/userslist');
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

router.get('/logout',csrfProtection, function(req, res, next) {
	if (req.session.user) {
		delete req.session.user;
		res.redirect('/');
	}
});
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.get('/profile/:id',csrfProtection, function(req, res, next){
			var id = req.params.id;
			var page = req.query.page;
								console.log(page);
			 User.findById(id, function(err, user){
				if(err) return next(err);
				if(!user) return res.send(404);
				if(user){
					Composition.find({author: user._id}).sort( {"date" : -1} ).exec(function(err, stories){
					if(err) return next(err);
					if(!stories) return res.send(404);
					else{
						res.render('profile', {csrfToken: req.csrfToken(), user: req.session.user, author: user, stories: stories});
					}
				});
		    }
		});

			});

//Удаление пользователя
router.post('/:id/delete',csrfProtection, function(req, res, next){
	if(req.session.user){
		var id = req.params.id;
		console.log(id);
		Composition.find({author: id}, function(err, stories){
			stories.forEach(function(story){
				story.remove(function(err){
					if(err) return next(err);
				});
			});
		});
		User.findById(id, function(err, user){
			if(err) return next(err);
			if(!user) return res.send(404);
			else{
				user.remove(function(err){
	        if(err) return next(err);
	        else res.redirect('/admin/userslist');
	      });
			}
		});
	}

});



module.exports = router;
