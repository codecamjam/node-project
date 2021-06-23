const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
// .catch(() => console.log('ERROR'));

const port = process.env.PORT || 3000;

//because process.exit is a hard stop,
//handle gracefully by saving the server
//as a variable and calliong server.close()
// in the unhandledRejection listener
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//so we did this to handle unhandle rejections
//but process.exit is a hard exit
//its better to gracefully close the server
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  // process.exit(0); //0 success, 1 uncaught exception
  server.close(() => process.exit(1));
});
