const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

//user can update name and email address
exports.updateMe = catchAsync(async (req, res, next) => {
  //1 create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
        400
      )
    );
  }

  /*
  update user document
  we could try to use user.save() getting the user updating the properties
  and saving the doc but the problem with that is there are some fields
  that are required that we arent updating
  demonstration with req.body:
  {"name":"Jonas Schmedtmann"}
  const user = await User.findById(req.user.id);
  user.name = 'Jonas';
  await user.save();
  we get error: please confirm your password bc its a required field
  but we didnt specify it so the save method is not the correct option
  so instead we do findByIdAndUpdate since we're not dealing with sensitive data
  */

  //1st arg req.body, 2nd data x and 3rd argument is options
  //x is because we dont want to update everything in the body
  //need to guarantee only name and email can be updated
  //so in essence filter the req.body
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody, // x,
    {
      new: true, //return updated new object,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
