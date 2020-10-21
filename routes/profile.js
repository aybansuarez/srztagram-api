const express = require('express');
const db = require('mongoose');
const { cloudinary } = require('../config/cloudinary');

const User = require('../models/User');
const Profile = require('../models/Profile');

const router = express.Router();

// GET ALL PROFILES LIST
router.get('/all/except/:id', async (req, res) => {
  try {
    const profiles = await Profile.find({ _id: { $ne: req.params.id } });
    res.send(profiles);
  } catch (err) {
    res.status(400).send(err);
  }
});

// GET PROFILE DETAILS
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    Profile.findOne({ user: db.Types.ObjectId(user._id) })
      .then(profile => {
        res.send(profile);
      })
      .catch(err => res.status(400).send(err));
  } catch (err) {
    res.status(400).send(err);
  }
});

// UPDATE PROFILE
router.post('/:id/update', async (req, res) => {
  try {
    let avatar = req.body.avatar;
    if (avatar) {
      response = await cloudinary.uploader.upload(avatar, {
        upload_preset: 'mern_app'
      })
      avatar = response.secure_url;
    }

    let data = {
      name: req.body.name,
      bio: req.body.bio,
      username: req.body.username,
      birthday: req.body.birthday,
      is_private: req.body.is_private,
      avatar: avatar
    }

    if (!avatar) {
      delete data.avatar;
    }

    const profile = await Profile.findByIdAndUpdate(
      { _id: req.params.id }, { $set: data }, { new: true });
    await User.findByIdAndUpdate(
      { _id: db.Types.ObjectId(profile.user) }, {
      $set: {
        username: req.body.username,
        email: req.body.email
      }
    }, { new: true });
    res.send('Profile updated successfully.');
  } catch (err) {
    res.status(400).send('Encountered an error.');
  }
});

module.exports = router;
