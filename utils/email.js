const nodemailer = require('nodemailer');

/*
  1 create transporter
  transporter is a service that sends the email
  something like gmail for example (not what we gonna use)
  2 define email options 
  3 actually send the email with nodemailer
*/
//options - email, subject line, email content, etc
const sendEmail = async options => {
  //STEP 1 configuration of transport
  //For gmail: ACTIVATE IN GMAIL "LESS-SECURE-APP" option
  //not using gmail cuz gmail is not a great idea for a production app
  //you can only send 500 emails per day and quickly be marked as spammer
  //unless its a private app or only a few people, gmail isnt great
  //other options are sendgrid and mailgun (we use sendgrid later)
  //gonna use special dev service sends fake email service called mailtrap
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD //key is pass, not password
    }
  });

  //STEP 2 define the email options
  const mailOptions = {
    from: 'jonas Schemdtmann <hello@jonas.io>',
    to: options.email, // this option is the function parameter
    subject: options.subject,
    text: options.message
    // html: //could convert the message to html (will do later)
  };

  //STEP 3 send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
