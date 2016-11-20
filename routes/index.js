var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var busboyBodyParser = require('busboy-body-parser');
var fs = require('fs');
mongoose.Promise = global.Promise;


//var db = mongoose.connect('mongodb://localhost/mydb');

var User = require('../models/model');
var Composition = require('../models/composition');

router.get('/', function(req, res, next) {
	if(req.session.user){
		var data = {
			title: 'Моя страница',
			user : req.session.user
		}
		res.render('main', data);
	} else {
		var data = {
		  	title: 'Пиши-Вдохновляйся-Твори',
		}
		res.render('index', data);
	}
});

//--------------------Создать фф------------------------------
router.get('/createfic', function(req, res, next){
	if(req.session.user){
		res.render('createfic');
	}
	else res.render('index');

})

router.get('/addpart', function(req, res, next){
	if(req.session.user){
		res.render('addpart');
	}
	else res.render('index');
})

router.post('/createfic', function(req, res, next){
	var title = req.body.title;
	var fandom = req.body.fandom;
	var characters = req.body.characters;
	var size = req.body.size;
	var rating = req.body.rating;
	var genre = req.body.genre;
	var description = req.body.description;
	var authComment = req.body.authComment;
	var user = req.session.user;
	console.log(user);

	var composition = new Composition({title: title, author: user._id, characters: characters, rating: rating, genre: genre, size: size, description: description, authComment: authComment});
	composition.save(function(err){
		if(err) return next(err);
	});

	User.findOne({username: user.username}, function(err, user){
		if(user){
			user.stories.push(composition);
			user.save(function(err){
				if(err) return next(err);
			});
		}
		else if(err) {
			console.log("DIDNT FIND");
			return next(err);
		}
	})

	res.render('addpart', {name: "title"});
});

router.post('/addpart', function(req, res, next){
var user = req.session.user;
var name = req.body.name;
var st = req.body.status;
var text = req.body.text;

	Composition.findOneAndUpdate({author: user._id, title: name}, {status: req.body.status, text: req.body.text}, function(err){
		if(err){
			console.log("Нет такого фанфика");
			return next(err);
		}
	});
	res.render('profile', {user: user});
})
//------------------------------------------------------------------------------

// SETTINGS
router.get('/profile/settings', function(req, res, next){
	if(req.session.user) res.render('settings');
	else res.render('index');
});

router.post('/profile/settings', function(req, res, next){
	//var about = req.query.about;
	//	console.log(about);
/*	console.log(req)
	fs.readFile(req.files.image.path, function (err, data) {

  	var newPath = __dirname + "/uploads/uploadedFileName";
  	fs.writeFile(newPath, data, function (err) {
    	res.redirect("back");
  	});
	});*/

	var avaFile = req.files.image;
	console.log(avaFile);
	var base64String = avaFile.data.toString('base64');


	/*var base64String = avaFile.data.toString('base64');
	console.log(base64String);*/
	var user = req.session.user;
	//if(about === null) about = user.about;
	//if(avaFile === null) avaFile = user.avatar;  about: about,
	User.findOneAndUpdate({username: user.username}, {avatar: base64String}, function(err, user){
		if(err) return next(err);
		if(user){
			user.save(function(err){
				if(err) return next(err);
			});
			res.redirect('/users/profile/:username');
		}
	});


});

module.exports = router;
