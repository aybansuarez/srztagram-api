const express = require('express');
const db = require('mongoose');
const { cloudinary } = require('../config/cloudinary');

const User = require('../models/User');
const Profile = require('../models/Profile');

const router = express.Router();

// GET ALL PROFILES LIST
router.get('/search', async (req, res) => {
  var query = {};
  if (req.query.q) {
    query = {
      $or: [
        { username: { $regex: req.query.q, $options: 'i' } },
        { name: { $regex: req.query.q, $options: 'i' } }
      ]
    }
  }

  try {
    let profiles = await Profile.find(query).limit(5);
    if (req.query.q) {
      profiles = await Profile.find(query);
    }
    res.send(profiles);
  } catch (err) {
    res.status(400).send(err);
  }
});


router.get('/:username/followers', async (req, res) => {
  try {
    const profile = await Profile.findOne(
      { username: req.params.username }
    ).populate({ path: 'followers' });

    res.send(profile.followers);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:username/following', async (req, res) => {
  try {
    const profile = await Profile.findOne(
      { username: req.params.username }
    ).populate({ path: 'following' });

    res.send(profile.following);
  } catch (err) {
    res.status(400).send(err);
  }
});

// GET PROFILE DETAILS
router.get('/:username', async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    const user = await User.findById(db.Types.ObjectId(profile._id));
    const data = await JSON.parse(JSON.stringify(profile));
    data.email = user.email;
  
    res.json(data);
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
        upload_preset: process.env.CLOUDINARY_FOLDER || 'dev_folder'
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
