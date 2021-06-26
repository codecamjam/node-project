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
    select: false
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
  },
  passwordChangedAt: Date //this property will change whenever pw is changed
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};

//we pass the jwt timestamp (when the token was issued)
userSchema.methods.changedPasswordAfter = function(
  JWTTimestamp
) {
  //THIS points to current document
  //most of user documents wont have this property
  //so only if they have this property do we need to handle this
  if (this.passwordChangedAt) {
    // 2019-04-30T00:00:00.000Z 1624722208
    // console.log(this.passwordChangedAt, JWTTimestamp);
    //so we need to format the timestamp
    //its a date so it has date functions
    //it was in milliseconds so need to divide by 1000 and parseInt
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10 //base 10
    );
    // console.log(changedTimestamp, JWTTimestamp);

    //false means not changed. not changed means the time that the token
    //(JWTTimestamp) was issued was less than the changed timestamp
    return JWTTimestamp < changedTimestamp;
    /* Lets say the toke was issued at time 100 but then we changed the pw at time 200
    100 < 200 so we changed the password after the token was issued. in this case
    100 < 200  

    but now lets say the password was changed at 200 but then only after that we issued the token at time 300 so 300 < 200 false NOT CHANGED
    */
  }

  //default is the user has not changed his password after the token was issued
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
