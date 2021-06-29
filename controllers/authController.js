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

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to the token no longer exists',
        401
      )
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again.',
        401
      )
    );
  }

  //GRANT USER ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles:[admin, lead-guide] role=user
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403 //forbidden
        )
      );
    }

    next();
  };
};

/* 
  Provide email address then get a link to click
  2 steps
  1 user sends post req to forgot pw route with this email
  this creates reset token and send to email address that 
  was provided
  random token not a jwt token
  2 user then sends token and email to update new password
*/
//step 1 get user based on posted email then generate random token
//send to users email
exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    //get user based on email
    //findOne and not findById because we dont know id and user doesn know his id either

    const user = await User.findOne({
      email: req.body.email
    });

    if (!user) {
      return next(
        new AppError(
          'There is no user with that email address.',
          404
        )
      );
    }

    //generate random reset token
    const resetToken = user.createPasswordResetToken();

    //so we didnt update/save the document. we just modified it,
    //so we need to save it
    /* on first post with
    no body we were trying to save a document but didnt specify the required data*/
    //this will deactivate all validators in our schema
    await user.save({ validateBeforeSave: false });

    //send it to users email
  }
);

//step 2
exports.resetPassword = catchAsync(
  async (req, res, next) => {}
);
