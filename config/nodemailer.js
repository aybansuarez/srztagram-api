const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
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
