const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Please provide email and password', 400)
    );
  }

  const user = await User.findOne({ email }).select(
    '+password'
  );

  console.log(user);
  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(
      new AppError('Incorrect email or password', 401)
    );
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to get access.',
        401
      )
    );
  }

  //need to validation/verify the token
  //basically a token where nobody tried to change the payload
  //in our case, the payload is the user id
  //for which the token was issued
  //2 verification token (jwt algo verifies token)
  //3rd argument is callback fn so we promisify it
  //to use async/await
  //this returns decoded payload from JWT
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  //we will see the user id, iat=creation data, and exp=exp date
  //so we got the correct user id
  console.log(decoded);

  //MOST TUTORIALS STOP AT STEP 2

  //BUT WHAT IF USER HAS BEEN DELETED IN THE MEANTIME
  //SO THE TOKEN WOULD STILL EXIST BUT IF THE USER NO LONG EXIST
  //THEN WE DONT WANT THEM TO LOGIN

  //WHAT IF USER CHANGE PASSWORD AFTER THE TOKEN HAS BEEN ISSUED??
  //THAT SHOULD ALSO NOT WORK. EXAMPLE: IMIAGINE SOMEONE STOLE JWT
  //FROM A USER BUT THEN IN ORDER TO PROTECT AGAINST THAT, USER
  //CHANGES HIS PASSWORD. SO THAT OLD TOKEN BEFORE PW WAS CHANGED
  //SHOULD NOT LONGER BE VALID TO ACCESS PROTECTED ROUTES

  //3 check if user still exists
  //this is why we used user _id as the payload
  //fresh/current user bc not a new user...its a user based on decoded id
  //be 100% sure id is correct
  //since we made it this far in the code and verification was successful
  //originally he had it labelled fresh user
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to the token no longer exists',
        401
      )
    );
  }

  // { id: '123456789', iat: 1624721940, exp: 1632497940 }
  //4 check if user changed password after the token JWT was issued
  //returns true if user changed their pw
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again.',
        401
      )
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  //only reach this point if everything is correct
  req.user = currentUser;
  next();
});
