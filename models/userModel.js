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
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  }
});

userSchema.pre('save', async function(next) {
  //JONAS COMMENT: ONLY RUN THIS FUNC IF PW WAS ACTUALLY MODIFIED
  if (!this.isModified('password')) return next();
  //JONAS COMMENT: HASH THE PW WITH COST OF 12
  this.password = await bcrypt.hash(this.password, 12);
  //JONAS COMMMENT: DELETE PASSWORDCONFIRM FIELD
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
