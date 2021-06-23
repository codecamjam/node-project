const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // });

  //create an error then on the error object, add status and statusCode so
  //our error handler can use them
  const err = new Error(
    `Can't find ${req.originalUrl} on this server!`
  );

  err.status = 'fail';
  err.statusCode = 404;

  //IF THE NEXT FUNCTION HAS AN ARGUMENT, EXPRESS ASSUMES ITS AN ERROR
  //IT WILL THEN SKIP ALL THE NEXT MIDDLEWARES IN THE MW STACK
  //AND SEND THE ERROR TO THE GLOBAL ERROR HANDLER
  next(err);
});

//express error handling middleware
//error first function
app.use((err, req, res, next) => {
  //we dont know what status code cuz it could be
  //many scenarios
  //so we define the status code on the error
  //could be error codes that we didnt make
  //could come from other places in the code
  //therefore we make a default error status code
  err.statusCode = err.statusCode || 500; //internal server error 500
  err.status = err.status || 'error'; //400/404 is fail, 500 server error

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
