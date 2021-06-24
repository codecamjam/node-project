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
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please provide a valid email'
    ]
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false //this will prevent the pw from being shown in res output (didnt work in post)
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //THIS ONLY WORKS ON CREATE OR ON SAVE!!!!!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

//here we create an instance method
//a method that will be available on all documents
//in the user collection

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  //THIS points to current document
  //but bc password.select === false,
  //this.password is not available
  //this function will return true if passwords are same, false if not
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
