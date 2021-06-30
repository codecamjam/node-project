const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//GLOBAL MIDDLEWARES

//best to use helmet early in the mw stack
//Set security http headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

//Body parser - basically reading data from body into req.body
//we can also limit the amt of data coming from the body (limit: 10kb)
app.use(express.json({ limit: '10kb' }));

//SANITIZE THE DATA RIGHT AFTER BODY PARSER
//Data sanitization against noswl query injection
// {
//   "email": {"$gt": ""},
//   "password": "pass1234"
// } /login THIS WOULD RETURN ADMIN!!!
/* 
This mw looks at req.body, req.query string, and req.params 
and filters out all dollar signs and dots cuz thats how mongodb
operators work so by removing them, they no longer work
*/
app.use(mongoSanitize());

//data sanitization against XSS
/* 
this cleans any user input from malicious html code
so imagine a hacker inserts bad html code with js attached
then that would be injected into our html sight so that could be really bad
{
    "email": "tester@jonas.io",
    "password": "real-password",
    "passwordConfirm": "real-password",
    "name": "<div id='bad-code'>Name</div>"
}
if posted in signup route,
the name value would be converted to string so html cant be injected
*/
app.use(xss());

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
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
