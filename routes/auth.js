const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const db = require('mongoose');

const User = require('../models/User');
const Profile = require('../models/Profile');
// const Following = require('../models/Following');
// const Follower = require('../models/Follower');
const userValidation = require('../validations/userValidation');

const router = express.Router();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user) => {
    if (error) res.status(400).send(error);
    if (!user) {
      res.status(401).send(
        'Login failed. Please enter a correct the username/email and password.'
      );
    } else {
      req.logIn(user, (error) => {
        if (error) res.status(400).send(error);
        res.send(req.user);
      });
    }
  })(req, res, next);
});

router.post('/signup', (req, res) => {
  const { error } = userValidation({
    Name: req.body.name,
    Username: req.body.username,
    Email: req.body.email,
    Password: req.body.password,
  });
  if (error) return res.status(400).send(error.details[0].message);

  const query = [{ username: req.body.username }, { email: req.body.email }];
  User.findOne({ $or: query }, async (err, user) => {
    if (err) res.status(400).send(err);
    // Validate data before creating user

    if (user) res.status(409).send("User already exists");
    if (!user) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });
      await newUser.save();

      const newProfile = new Profile({
        name: req.body.name,
        username: newUser.username,
        birthday: new Date("2000-01-01"),
        user: db.Types.ObjectId(newUser._id)
      });
      await newProfile.save();

      // const newFollowing = new Following({
      //   profile: db.Types.ObjectId(newProfile._id)
      // });
      // await newFollowing.save();

      // const newFollower = new Follower({
      //   profile: db.Types.ObjectId(newProfile._id)
      // });
      // await newFollower.save();
      res.send();
    }
  });
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.send();
});

module.exports = router;