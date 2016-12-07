var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var mongoose = require('mongoose');

var User = require('../models/model');
var Composition = require('../models/composition');

router.get('/users', function(req, res, next){
  User.find(function(err, users){
    if(err){
      res.send(500);
    }
    else{
      res.send(users);
    }
  });
});

router.get('/stories', function(req, res, next){
  Composition.find(function(err, stories){
    if(err) res.send(500);
    else res.send(stories);
  });
});

router.post('/users', function(req, res, next){
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
	user.save(function(err, user){
		if(err) return next(err);
		else{
			res.send("Successful created!");
		}
	});
});

router.post('/stories', function(req, res, next){
  var title = req.body.title;
	var fandom = req.body.fandom;
	var characters = req.body.characters;
	var size = req.body.size;
	var rating = req.body.rating;
	var genre = req.body.genre;
	var description = req.body.description;
	var authComment = req.body.authComment;
  var text = req.body.text;

	var composition = new Composition({title: title, characters: characters, rating: rating, genre: genre, size: size, description: description, authComment: authComment, text: text});
	composition.save(function(err){
		if(err) return next(err);
    else return res.send("Successful created!");
	});
});

// router.post('/addStoryToAuth', function(req, res, next){
//   var username = req.body.username;
//   var title = req.body.title;
//   var story = Composition.findOne({title: title}, function(err, st){
//     if(err) return next(err);
//     else if(!story){
//       res.send("This story doesn't exist.");
//     }
//   });
//
//   var user = User.findOne({username: username}, function(err, user){
//     if(err) return next(err);
//     else if(user){
//       user.stories.push(story);
//       user.save(function(err){
//         if(err) return next(err);
//       });
//       res.send("Story was added.");
//     }
//     else res.send("This user doesn't exist");
//   });
//
//   Composition.findOneAndUpdate({title: title}, {author: user._id}, function(err, st){
//     if(err) return next(err);
//     else{
//       st.save(function(err){
//         if(err) return next(err);
//       });
//     }
//   });
// });

router.get('/users/:id', function(req, res, next){
  User.findById(req.params.id, function(err, user){
    if(err) return next(err);
   if(user) res.send(user);
    else res.send(404);
  });
});

router.get('/stories/:id', function(req, res, next){
  Composition.findById(req.params.id, function(err, st){
    if(err) return next(err);
    if(st) return res.send(st);
    else return res.send(404);
  });
});

router.delete('/users/:id', function(req, res, next){
  User.findById(req.params.id, function(err, user){
    if(err) return next(err);
    if(user){
      user.remove(function(err){
        if(err) return next(err);
        else res.send(200);
      });
    }
    else{
      res.send(404);
    }
  });
});

router.delete('/stories/:id', function(req, res, next){
  Composition.findById(req.params.id, function(err, st){
    if(err) return next(err);
    if(st){
      st.remove(function(err){
        if(err) return next(err);
        else res.send(200);
      });
    }
    else res.send(404);
  });
});

router.put('/users/:id', function(req, res, next){
  User.findById(req.params.id, function(err, user){
    if(err) return next(err);
    if(!user) return res.send(404);

    var username = req.body.username;
    var password = req.body.password;

    User.findOne({username:username}, function(err, us){
      if(err) return next(err);
      if(us){
        res.send("This username is already existed!");
      }
      else{
        User.findOneAndUpdate({username: user.username}, {username: username, password: password}, function(err, user1){
          if(err) return next(err);
          if(user1){
            user1.save(function(err){
              if(err) res.send(500);
            });
          }
        });
      }
    });
  });
});

router.put('/stories/:id', function(req, res, next){
  Composition.findById(req.params.id, function(err, story){
    if(err) return next(err);
    if(!story) res.send(404);

    story.title = req.body.title;
    story.fandom = req.body.fandom;
    story.characters = req.body.characters;
    story.size = req.body.size;
    story.rating = req.body.rating;
    story.genre = req.body.genre;
    story.description = req.body.description;
    story.authComment = req.body.authComment;
    story.text = req.body.text;

    story.save(function(err){
      if(err) return next(err);
      else return res.send(200);
    });
  });
});


module.exports = router;
