var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var busboyBodyParser = require('busboy-body-parser');
mongoose.Promise = global.Promise;



//var db = mongoose.connect('mongodb://localhost/mydb');

var User = require('../models/model');
var Composition = require('../models/composition');

router.get('/homepage', function(req, res, next){
	Composition.find({}).populate('author').exec(function(err, stories){
		if(err) {
			return next(err);
		}
		if(stories){
			//var user = req.session.user;
			res.render('homePage', {stories:stories, author: stories.author});
		}
		else{
			res.send("There is no story on the site" );
		}
	});
});

router.get('/', function(req, res, next) {
	if(req.session.user){
		Composition.find({}).populate('author').exec(function(err, stories){
			if(err) return next(err);
			if(stories){
				res.render('homePage', {stories:stories, user: req.session.user, author: stories.author});
			}
			else{
				res.send("There is no story on the site" );
			}
		});
	} else {
		var data = {
		  	title: 'Пиши-Вдохновляйся-Твори',
				user: req.session.user
		}
		console.log("Hello");
		res.render('index', data);
	}
});

//--------------------Создать фф------------------------------
router.get('/createfic', function(req, res, next){
	if(req.session.user){
		res.render('createfic', {user: req.session.user});
	}
	else res.render('index', {user: req.session.user});

})

router.get('/:id/addpart', function(req, res, next){
	if(req.session.user){
		Composition.findOne({_id: req.params.id}, function(err, story){
			if(err) return next(err);
			if(story){
				return res.render('addpart', {user: req.session.user, story: story});
			}
			else{
				res.send(404);
			}
		});
	}
	else res.render('index', {user: req.session.user});
})

router.get('/myfics', function(req, res, next){
	var user = req.session.user;
	if(user){
		Composition.find({author: user._id}, function(err, stories){
			if(err) return next(err);
			if(stories){
				return res.render('myfics', {user: user, stories: stories});
			}
		})
	}
	else res.render('index', {user: req.session.user});
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

	var composition = new Composition({title: title, author: user._id, fandom: fandom, characters: characters, rating: rating, genre: genre, size: size, description: description, authComment: authComment});
	composition.save(function(err){
		if(err) return next(err);
	});

	var us = User.findOne({username: user.username}, function(err, user){
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

	// res.redirect('/' + composition._id + '/addpart', {user: us, story: composition});
	 res.redirect('/' + composition._id + '/addpart');
});

router.post('/addpart', function(req, res, next){
let user = req.session.user;
var name = req.body.name;
var st = req.body.status;
var text = req.body.text;

//var text = text1.replace(/\n|\r\n|\r/g, '<br/>');//replace(/\n/gi, "<br/>");

	Composition.findOneAndUpdate({author: user._id, title: name}, {status: st, text: text}, function(err){
		if(err){
			console.log("Нет такого фанфика");
			return next(err);
		}
	});
	var stories = Composition.find({author: user._id}, function(err, stories){
		if(err) return next(err);
		if(stories){
			res.render('profile', {user: user, stories: stories});
		}
		else return res.send(500);
	});

});
//------------------------------------------------------------------------------

// SETTINGS

function authorStories(id){
	var stories = Composition.find({author: id}, function(err, stories){
		if(err) return next(err);
		if(stories){
			return stories;
		}
		else return res.send(500);
	});
}


router.get('/profile/settings', function(req, res, next){
	if(req.session.user) res.render('settings', {user: req.session.user});
	else res.render('index', {user: req.session.user});
});

router.post('/profile/settings', function(req, res, next){
	var avaFile = req.files.image;
	var about = req.body.about;
	var base64String = avaFile.data.toString('base64');

	var user = req.session.user;
	if(about === null) about = user.about;
	if(avaFile === null) avaFile = user.avatar;
	return  new Promise(function(resolve, reject){
		User.findOneAndUpdate({username: user.username}, {about: about, avatar: base64String}, function(err, user){
			if(err) return next(err);
			if(user){
				user.save(function(err){
					if(err) return next(err);
				});
			}
		});
		resolve(res.redirect('/users/profile/' + user.username));
	});
});

router.get('/story/:id', function(req, res, next){
	var id = req.params.id;
	Composition.findOne({ _id: id }).populate('author').exec(function (err, story) {
  if (err) return next(err);
  if(story){
		return res.render('story', {story: story, author: story.author, user: req.session.user});
	}
	else{
		return res.send(404);
	}
});
});


router.post('/search', function(req, res, next){
	var ask = req.body.search;
	console.log("/"+ask+"/");
	var stories = Composition.find({title : {'$regex' : '.*' + ask + '.*', '$options': '$i'}}, function(err, stories) {
		if(err) return next(err);
		if(!stories){
			return res.send(404);
		}
		else res.render('search', {stories: stories, user: req.session.user});
	});
});

router.post('/deletefic/:id', function(req, res, next){

	if(req.session.user || req.session.admin){
		var id = req.params.id;
		Composition.findById(id, function(err, story){
			if(err) return next(err);
			if(!story) return res.send(404);
			else{
				story.remove(function(err){
	        if(err) return next(err);
	        else res.redirect('/myfics');
	      });
			}
		});
	}

});


module.exports = router;
