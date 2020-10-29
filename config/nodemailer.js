const nodemailer = require('nodemailer');

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

module.exports = transporter;
