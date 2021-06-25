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
  // const token = jwt.sign(
  //   { id: newUser._id },
  //   process.env.JWT_SECRET,
  //   {
  //     expiresIn: process.env.JWT_EXPIRES_IN
  //   }
  // );

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

  //1 check if email and password exist
  if (!email || !password) {
    return next(
      new AppError('Please provide email and password', 400)
    );
  }

  //2 check if user exists and password is correct
  //this will now also not contain the password
  //we use select to select a few fields from the db that we needed
  //so password was not selected to be displayed so
  //to include a field back in the output, use +fieldname
  const user = await User.findOne({ email }).select(
    '+password'
  );

  console.log(user);
  //need to verify that the password matches pw in the db
  // const correct = await user.correctPassword(
  //   password,
  //   user.password
  // );

  // if (!user || !correct) {
  //because there are 2 awaits, 1 for user and 2 for correct,
  //move the correct await into the if condition
  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(
      //vague message to increase security (less info for hacker)
      new AppError('Incorrect email or password', 401) //401 is unauthorized
    );
  }

  //3 if everything is ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1 getting token and check if it's there
  //common practice is send token in header in http request
  //key: Authorization
  //value: Bearer jklhkhljkhjkhkjhkjhkj <- part is the token (jklhkl...etc)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  console.log(token);

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to get access.',
        401 //unauthorized
      )
    );
  }
  //need to validation/verify the token
  //basically a token where nobody tried to change the payload
  //in our case, the payload is the user id
  //for which the token was issued
  //2 verification token (jwt algo verifies token)

  //3 check if user still exists

  //4 check if user changed password after the token JWT was issued

  next();
});
