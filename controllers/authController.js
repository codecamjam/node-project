const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  //this is a security flaw
  //we create a new user using the body
  //this means user can specify role as admin
  //this is bad serious security flaw
  const newUser = await User.create(req.body);

  //THEREFORE THIS IS better
  //prevents admin creation
  //so we'd have to go into compass and edit admin manually
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   confirmPassword: req.body.confirmPassword
  // });

  //get id from new user
  //1 payload we put in our jwt
  //2 next param is secret
  //HSA256 encryption secret must be >=32 chars long
  //longer the better
  //token header will be created automatically
  //3 options (session expiration date)
  const token = jwt.sign(
    { id: newUser._id }, //1
    process.env.JWT_SECRET, //2
    {
      expiresIn: process.env.JWT_EXPIRES_IN //3
    }
  );
  //all we need to do to login a new user
  //bc user was created and right away
  //we log user in by sending a token
  //user client will store the token somehow someway
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});
