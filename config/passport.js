const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcrypt');
const db = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;

const initialize = passport => {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const userQuery = {
        $or: [
          { username: username }, { email: username }
        ]
      };
      try {
        // Check if no user
        const user = await User.findOne(userQuery);
        if (!user) return done(null, false);

        // Check if password doesn't match
        validate = await bcrypt.compare(password, user.password);
        if (!validate) return done(null, false);

        const profile = await Profile.findOne(
          { user: db.Types.ObjectId(user._id) }
        );
        if (!profile) return done(null, false);

        const data = {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: profile._id,
        }
        return done(null, data);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({ _id: id })
      .then(user => {
        done(null, user.username);
      })
      .catch(err => console.log(err));
  });
};

module.exports = initialize;