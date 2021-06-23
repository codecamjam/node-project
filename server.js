const mongoose = require('mongoose');
const dotenv = require('dotenv');

//UNCAUGHT EXCEPTIONS
///needs to be above all code to catch uncaught exceptions
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  //for uncaught exceptions, its a good
  //idea to just crash the program (exit 0)
  //because the entire node process is in an unclean
  //state. to fix, terminate the program and restart it
  process.exit(0);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//suppose the mongodb password is wrong
//well without the catch block
//we get an unhandled promise rejection
//move to on('unhandledRejection')
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection successful');
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => process.exit(1));
});

// console.log(x);

//IDEALLY ERRORS SHOULD BE HANDLED RIGHT WHERE THEY OCCUR,
//NOT JUST RELY ON THESE CALLBACKS
