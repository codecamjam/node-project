const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
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
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date //bc this reset will expire after a certain time for security
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

userSchema.methods.changedPasswordAfter = function(
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

/*pw reset token should be random sstring
  doesnt need to be as cryptographically strong as pw hash
  so we use random bytes from crypto module
  */
userSchema.methods.createPasswordResetToken = function() {
  //32 number of characters, convert to hexidecimal string
  const resetToken = crypto.randomBytes(32).toString('hex');

  /* basically this token is what we send to user. kinda like reset pw so user
  can create new real pw so only user will have access to this token so
  it behaves kinda like a pw so since its basically a pw. it means if a hacker gets db access,
  then the hacker has access to accounts by setting a new pw so if we stored the reset token,
  then the attacker could use this token and create a new pw aka control your account
  SO NEVER STORE A PLAIN RESET TOKEN INTO THE DB but it doesnt need strong hash cuz
  these reset tokens arent a big attack vector
  */

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken) //encrypts the string
    .digest('hex');
  /* we save this reset token in a new field in the db schema
  so we can then compare it to the token that user provides
  */

  console.log({ resetToken }, this.passwordResetToken);

  //want this to be 10 min
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //want to return plaintext token cuz thats what we'll send to the email
  //we need to send the unencrypted token cuz otherwise it wouldnt make sense to encrypt at all
  //cuz it would = the one in the db
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
