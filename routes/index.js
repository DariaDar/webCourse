var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var busboyBodyParser = require('busboy-body-parser');
var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate');

var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

mongoose.Promise = global.Promise;


var User = require('../models/model');
var Composition = require('../models/composition');

router.get('/', csrfProtection, function(req, res, next) {
    Composition.find({}).skip(0).limit(5).populate('author').sort( {"date" : -1} ).exec(function(err, stories){
      if(err) return next(err);
      if(stories){
        res.render('homePage', {
          csrfToken: req.csrfToken(),
          stories: stories,
          user: req.session.user,
    });
  }
});
});

router.get('/all',csrfProtection, function(req, res, next){
  var page = req.query.page;
  console.log(page);
  var lim = 2;

      Composition.find({}).skip(0 + (page-1) * lim).limit(lim).populate('author').sort( {"date" : -1} ).exec(function(err, stories){
        if(err) return next(err);
        if(stories){
          Composition.find().count(function(err, countSt)  {
            var count = Math.round(countSt/lim);
            console.log(countSt);
          res.render('all', {
            csrfToken: req.csrfToken(),
            curr:page,
            pageCount: count,
            stories: stories,
            user: req.session.user,
      });
    });
    }
})
});


//--------------------Создать фф------------------------------
router.get('/createfic', csrfProtection, function(req, res, next) {
    if (req.session.user) {
        res.render('createfic', {
          csrfToken: req.csrfToken(),
            user: req.session.user
        });
    } else res.render('index', {
      csrfToken: req.csrfToken(),
        user: req.session.user
    });

})

router.get('/:id/addpart', csrfProtection, function(req, res, next) {
    if (req.session.user) {
        Composition.findOne({
            _id: req.params.id
        }, function(err, story) {
            if (err) return next(err);
            if (story) {
                return res.render('addpart', {
                    csrfToken: req.csrfToken(),
                    user: req.session.user,
                    story: story
                });
            } else {
                res.send(404);
            }
        });
    } else res.render('index', {
      csrfToken: req.csrfToken(),
        user: req.session.user
    });
})

router.get('/myfics',csrfProtection,  function(req, res, next) {
    var user = req.session.user;
    if (user) {
        Composition.find({
            author: user._id
        }, function(err, stories) {
            if (err) return next(err);
            if (stories) {
                return res.render('myfics', {
                  csrfToken: req.csrfToken(),
                    user: user,
                    stories: stories
                });
            }
        });
    } else res.render('index', {
      csrfToken: req.csrfToken(),
        user: req.session.user
    });
});

router.post('/createfic', csrfProtection,function(req, res, next) {
    var title = req.body.title;
    var fandom = req.body.fandom;
    var characters = req.body.characters;
    var size = req.body.size;
    var rating = req.body.rating;
    var genre = req.body.genre;
    var description = req.body.description;
    var authComment = req.body.authComment;
    var user = req.session.user;

    var composition = new Composition({
        title: title,
        author: user._id,
        fandom: fandom,
        characters: characters,
        rating: rating,
        genre: genre,
        size: size,
        description: description,
        authComment: authComment
    });
    composition.save(function(err) {
        if (err) return next(err);
    });

    var us = User.findOne({
        username: user.username
    }, function(err, user) {
        if (user) {
            user.stories.push(composition);
            user.save(function(err) {
                if (err) return next(err);
            });
        } else if (err) {
            console.log("DIDNT FIND");
            return next(err);
        }
    })

    // res.redirect('/' + composition._id + '/addpart', {user: us, story: composition});
    res.redirect('/' + composition._id + '/addpart');
});

router.post('/addpart',csrfProtection, function(req, res, next) {
    let user = req.session.user;
    var name = req.body.name;
    var st = req.body.status;
    var text = req.body.text;
    var now = moment();
    moment.lang('ru');

    Composition.findOneAndUpdate({
        author: user._id,
        title: name
    }, {
        status: st,
        text: text,
        date: Date.now()
    }, function(err) {
        if (err) {
            console.log("Нет такого фанфика");
            return next(err);
        }
    });
    var stories = Composition.find({
        author: user._id
    }, function(err, stories) {
        if (err) return next(err);
        if (stories) {
            res.redirect('/users/profile/' + user._id);
        } else return res.send(500);
    });

});

router.post('/:id/addcomment', csrfProtection,function(req, res, next) {
    var user = req.session.user;
    if (user) {
        var id = req.params.id;
        var comment = req.body.comment;
        var now = moment();
        moment.lang('ru');
        Composition.findByIdAndUpdate(id, {
            $push: {
                'comments': {
                    body: comment,
                    author: user.username,
                    date: now.format('LLLL')
                }
            }
        }, function(err, story) {
            if (err) return next(err);
            if (story) {
                res.redirect('/story/' + id);
            } else return res.send(500);
        });
    } else res.send(404);
});

router.post('/:sid/:cid/deletecomment', csrfProtection,function(req, res, next) {
    var st = req.params.sid;
    var comm = req.params.cid;

    Composition.findByIdAndUpdate(st, {
        $pull: {
            comments: {
                _id: comm
            }
        }
    }, function(err, story) {
        if (err) return next(err);
        if (!story) return res.send(404);
        else {
            res.redirect('/story/' + st);
        }
    });
});


//------------------------------------------------------------------------------

// SETTINGS

router.get('/profile/settings', csrfProtection, function(req, res, next) {
  var user = req.session.user;
    if (user){
      User.findOne({_id: user._id}, function(err, user){
        if(err) return next(err);
        if(user){
         res.render('settings', {person: user, user: user, csrfToken: req.csrfToken()});
        }
      })
    }
    else{
      res.render('index', {
        csrfToken: req.csrfToken(),
        user: req.session.user
    });
  }
});

router.post('/profile/settings',csrfProtection, function(req, res, next) {
    var avaFile = req.files.image;
    var about = req.body.about;
    var base64String = avaFile.data.toString('base64');

    var user = req.session.user;
    if (about === null) about = user.about;
    if (avaFile === null) avaFile = user.avatar;
    return new Promise(function(resolve, reject) {
        User.findOneAndUpdate({
            username: user.username
        }, {
            about: about,
            avatar: base64String
        }, function(err, user) {
            if (err) return next(err);
            if (user) {
                user.save(function(err) {
                    if (err) return next(err);
                });
            }
        });
        resolve(res.redirect('/users/profile/' + user._id));
    });
});

router.get('/story/:id', csrfProtection, function(req, res, next) {
    var id = req.params.id;
    Composition.findOne({
        _id: id
    }).populate('author').exec(function(err, story) {
        if (err) return next(err);
        if (story) {
          var date = story.date;
          var d = date.toDateString();
            return res.render('story', {
              csrfToken: req.csrfToken(),
                date: d,
                story: story,
                user: req.session.user
            });
        } else {
            return res.send(404);
        }
    });
});

router.get('/search', csrfProtection, function(req, res, next) {
    var ask = req.query.search;
    var stories = Composition.find({
        title: {
            '$regex': '.*' + ask + '.*',
            '$options': '$i'
        }
    }).populate('author').exec(function(err, stories) {
        if (err) return next(err);
        if (!stories) {
            return res.send(404);
        } else res.render('search', {
          csrfToken: req.csrfToken(),
            stories: stories,
            user: req.session.user
        });
    });
});

router.post('/deletefic/:id', csrfProtection,function(req, res, next) {

    if (req.session.user) {
        var id = req.params.id;
        var authID = req.params.author;
        //User.findByIdAndUpdate(authID, { $pull: {stories:{_id: id}}});

        Composition.findById(id, function(err, story) {
            if (err) return next(err);
            if (!story) return res.send(404);
            else {
                story.remove(function(err) {
                    if (err) return next(err);
                    else res.redirect('/myfics');
                });
            }
        });
    }
});

router.get('/fullsearch',csrfProtection, function(req, res, next) {
    if (req.session.user) {
        res.render('fullsearch', {
          csrfToken: req.csrfToken(),
            user: req.session.user
        });
    }
    else {
    res.render('index', {
      csrfToken: req.csrfToken(),
        user: req.session.user
    });
  }

});
router.get('/fullsearchres',csrfProtection, function(req, res, next) {
    if (req.session.user) {
        var size = req.query.size;
        var rating = req.query.rating;
        var genres = req.query.genre;
        var allGenres = [];
        allGenres = genres.split(';');

        console.log(allGenres[0], allGenres[1]);
        console.log(size, rating);
        console.log(allGenres);

        Composition.find({
            size:  size,
            rating: rating,
            genre: {
                $all: allGenres
            }
        }).populate('author').exec(function(err, stories) {
            if (err) return next(err);
            if (!stories) res.send(404);
            else {
                // res.render('search', {
                //     stories: stories,
                //     user: req.session.user
                // });
                res.send(stories);
            }
        });
    }

});

router.get('/:id/changefic',csrfProtection, function(req, res, next) {
    if (req.session.user) {
        var id = req.params.id;
        Composition.findById(id, function(err, story) {
            if (err) return next(err);
            if (story)
                res.render('changefic', {
                  csrfToken: req.csrfToken(),
                    user: req.session.user,
                    story: story
                });
            else res.send(404);
        });
    } else {
        res.send(404);
    }
});

router.post('/changefic', csrfProtection,function(req, res, next) {
    var name = req.body.name;
    var title = req.body.title;
    var fandom = req.body.fandom;
    var characters = req.body.characters;
    var size = req.body.size;
    var rating = req.body.rating;
    var genre = req.body.genre;
    var description = req.body.description;
    var authComment = req.body.authComment;

    Composition.findOneAndUpdate({
        title: name
    }, {
        title: title,
        fandom: fandom,
        characters: characters,
        size: size,
        rating: rating,
        genre: genre,
        description: description,
        authComment: authComment
    }, function(err, fic) {
        if (err) return next(err);
        if (fic) {
            res.redirect('/story/' + fic._id);
        } else res.send(500);
    });
});


/*router.get('/:p', function(req, res, next){
  var query = {};
  //console.log(req.query);
  var options = {
    populate: "author",
    page: req.params.p,
    limit:3
  };
Composition.paginate(query, options).then(function(err, stories){
  if (err) return next(err);
  if (stories) {
      res.render('homePage', {
          stories: stories,
          user: req.session.user,
      });
  } else {
      res.send("There is no story on the site");
  }
  })
})*/


module.exports = router;
