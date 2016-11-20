var crypto = require('crypto'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = new Schema({
  username: {
      type: String,
      unique: true,
      required: true
  },
  hashedPassword: {
      type: String,
      required: true,
  },
  salt: {
    type: String,
    required: true
  },
  role: String,
  stories: [{type: Schema.Types.ObjectId, ref: 'Composition'}],
  avatar: {
    type: String
    //default: '/img/default.jpg'
  },
  about: {
    type: String,
    required: true
  }
});

/*var admin = new User({
    username: "root",
    hashedPassword: "cf3e6505070433a04f7ef52e3eacb932",
    salt: 'OFH725%okdIn&',
    role: "admin"
});*/



function hash(str, key) {
  return crypto.createHmac('sha1', key)
    .update(new Buffer(str, 'utf-8'))
    .digest('hex');
}

User.methods.checkUsername = function(username){
  return this.username === username;
}

User.virtual('password')
  .set(function(password){
    this._plainPassword = password;
    this.salt = 'OFH725%okdIn&';
    this.hashedPassword = hash(password, this.salt);
  })
  .get(function(){
    return this._plainPassword;
  });

  User.methods.checkPassword = function(password){
    return this.hashedPassword === hash(password, this.salt);
  }


module.exports = mongoose.model('User', User);
//.exports = mongoose.model('Composition', Composition);
