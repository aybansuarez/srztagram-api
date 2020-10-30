const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'aybansrz@gmail.com',
    pass: 'aybanzxc24',
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.use('compile', hbs({
  viewEngine: {
    extName: '.hbs',
    defaultLayout: false
  },
  viewPath: path.resolve(__dirname, '../views/'),
  extName: '.hbs',
}));

module.exports = transporter;
