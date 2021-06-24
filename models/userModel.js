const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, //all it does is transform the email to lowercase
    validate: [
      validator.isEmail,
      'Please provide a valid email'
    ]
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //THIS ONLY WORKS ON CREATE OR ON SAVE!!!!!!!
      //this means that whenever we update a user, we will have to
      //use save, not findOneAndUpdate like we did with tours
      validator: function(el) {
        //we return either true or false
        //true = valid
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  }
});

//encryption is gonna have between the moment we receieve the data and
//before the moment where its saved to the db
userSchema.pre('save', async function(next) {
  //only encrypt if pw field has been updated
  //only when pw is created or changed
  //THIS IS THE CURRENT DOCUMENT (in this case the current user)
  //if pw not modified, call next to move to next mw
  //JONAS COMMENT: ONLY RUN THIS FUNC IF PW WAS ACTUALLY MODIFIED
  if (!this.isModified('password')) return next();

  //if it was we are going to hash the pw with BCRYPT algo
  //first salt, then hash
  //SALT the password - just means it
  // adds a random string to the pw so that 2 equal passwords != the same hash
  //the second argument is a cost parameter
  //cost parameter - a measure of how cpu intensive this operation will be
  //default value is 10 but 12 is better
  //so basically the higher the cost, the better the pw will be encrypted
  //this hash func is the async version of this hash function
  //there's also a sync version but nah dawg
  //JONAS COMMENT: HASH THE PW WITH COST OF 12
  this.password = await bcrypt.hash(this.password, 12);

  //we only needed this for validation of password typed in correctly twice
  //this works even though passwordConfirm was required
  //that only means it was a required input, not a required field:value pair
  //to be persisted to the db
  //JONAS COMMMENT: DELETE PASSWORDCONFIRM FIELD
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
