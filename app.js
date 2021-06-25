const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

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
  //in express, this is how we access request headers
  //The standard for sending a token is we should
  //always use a header called Authorization
  //with a value that starts with Bearer
  //because we bear/have/possess this token
  //key: Authorization
  //value: Bearer jklhkhljkhjkhkjhkjhkj <- part is the token (jklhkl...etc)
  // {
  //   authorization: 'Bearer jklhkhljkhjkhkjhkjhkj',
  //   'user-agent': 'PostmanRuntime/7.28.0',
  //   accept: '*/*',
  //   'cache-control': 'no-cache',
  //   'postman-token': '91eea66c-f540-45e4-b0f2-cefc1fe315fe',
  //   host: '127.0.0.1:3000',
  //   'accept-encoding': 'gzip, deflate, br',
  //   connection: 'keep-alive'
  // }

  //express automatically makes all header name lowercase
  // console.log(req.headers);
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404
    )
  );
});

app.use(globalErrorHandler);

module.exports = app;
