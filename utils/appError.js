/* 
  This class will handle operational errors
  errors we can predict like a user creating 
  a tour w/o required fields
*/
class AppError extends Error {
  constructor(message, statusCode) {
    // we pass message because message is only param Error accepts
    //basically like calling error
    super(message);
    this.statusCode = statusCode;
    //can be either fail or error
    //status depends on status code
    //so if 400 fail, or if 500 then its an error
    this.status = `${statusCode}`.startsWith('4')
      ? 'fail'
      : 'error';

    //later we'll test for this property
    //and only send msgs back to clients
    //if this prop is true
    this.isOperational = true;

    //1 current object
    //2 AppError class itself
    //when a new object is created, and a constructor func is called
    //then that function call wont appear in the stack trace
    //to prevent polluting the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
