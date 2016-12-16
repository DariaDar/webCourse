var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Composition = new Schema({
  title: {
    type: String,
    required: true
  },
  author: { type: String, ref: 'User' },
  fandom:{
    type: String
  },
  characters: {
    type: String,
    required: true
  },
  rating:{
    type: String,
    required: true
  },
  genre: [{
    type: String,
    required: true
  }],
  size: {
    type: String,
    required: true
  },
  status:{
    type: String,
  },
  description: {
    type: String,
  },
  authComment: String,
  text: {
    type: String,
  },
  comments: [{ body: String, date: String, author:{ type: String, ref: "User"}}],
  date: { type: Date }
});


Composition.methods.getStoriesByAuthor = function(id){
  Composition.find({author: id}, function(err, stories){
    if(err) return next(err);
    if(!stories){
      return 500;
    }
    else return stories;
  });
};
Composition.methods.getAuthor = function(){
  Composition.findOne({ title: story.title}).populate('author').exec(function (err, story) {
    if(err) return next(err);
    if(story){
      return story.author.username;
    }
    else{
      return res.send(500);
    }
  });
};


module.exports = mongoose.model('Composition', Composition);
