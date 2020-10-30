const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('mongoose');
const crypto = require('crypto');

const transporter = require('../config/nodemailer');
const auth = require('../config/auth');
const User = require('../models/User');
const Token = require('../models/Token');
const Profile = require('../models/Profile');

router.post('/signup', async (req, res) => {
  try {
    let { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword)
      return res.status(400).json({ msg: 'All the fields required.' });

    if (username.length > 25)
      return res.status(400).json(
        { msg: 'Username is 25 characters max.' }
      );

    if (password.length < 8)
      return res.status(400).json(
        { msg: 'The password needs to be at least 8 characters long.' }
      );

    if (password !== confirmPassword)
      return res.status(400).json({ msg: 'Entered password does not match.' });

    if (email === password)
      return res.status(400).json(
        { msg: 'Password should not be the same as the email address.' }
      );

    const existingUser = await User.findOne({
      $or: [{ username: username }, { email: email }]
    });
    if (existingUser)
      return res.status(400).json(
        { msg: 'An account with this username/email already exists.' }
      );

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User(
      { username, email, password: hashedPassword }
    );
    const savedUser = await newUser.save();

    const token = new Token({
      user: db.Types.ObjectId(savedUser._id),
      type: 'email-verification',
      token: crypto.randomBytes(16).toString('hex')
    });

    // Save the verification token
    await token.save()

    // Send email asynchronous
    transporter.sendMail({
      from: '"SRZtagram | Verify Email" <aybansrz@gmail.com>',
      to: 'jedsuarez@gmail.com',
      subject: 'Thank you for signing up. Verify your email.',
      template: 'verifyEmail',
      context: {
        token: token.token,
        username,
        email,
      }
    });

    res.json({ msg: 'Sign up success! Please verify your email.' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json(
        { msg: 'Fill up all the fields required.' }
      );

    const user = await User.findOne({
      $or: [{ username: username }, { email: username }]
    });
    if (!user)
      return res.status(400).json(
        { msg: 'Please provide the correct credentials.' }
      );

    if (!user.verified)
      return res.status(400).json(
        { msg: 'This email is not yet verified. Please verify your email.' }
      );

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json(
        { msg: 'Please provide the correct credentials.' }
      );

    const token = jwt.sign({ id: user._id }, process.env.SECRET_TOKEN);
    res.json({ token, id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/email-verify', async (req, res) => {
  try {
    const token = await Token.findOne({
      token: req.body.token, type: 'email-verification', used: false
    });
    if (!token)
      return res.status(400).json({
        type: '404',
        msg: 'Unable to find token. Your token may have been used or expired.'
      });

    const user = await User.findById(token.user);

    user.verified = true;
    token.used = true;
    await user.save();
    await token.save();

    const newProfile = new Profile({
      _id: db.Types.ObjectId(user._id),
      name: user.username,
      username: user.username,
      birthday: new Date('2000-01-01'),
    });
    await newProfile.save();

    return res.json({ type: '200', msg: 'Email verified. You may now login.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/authenticate', async (req, res) => {
  try {
    const token = req.header('auth-token');
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.SECRET_TOKEN);

    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/current', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    res.json({ id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
