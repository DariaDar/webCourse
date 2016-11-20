var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Composition = new Schema({
  title: String,
  author: { type: String, ref: 'User' },
  characters: String,
  rating: String,
  genre: [{
    type: String
  }],
  size: String,
  status: String,
  description: String,
  authComment: String,
  text: String //parts:{pTitle: String, text: String}
});


module.exports = mongoose.model('Composition', Composition);
