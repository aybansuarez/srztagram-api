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
    res.status(400).send(err);
  }
});


// FOLLOW
// router.post('/:id1/follow/:id2', async (req, res) => {
//   try {
//     const profile1 = await Profile.findById(req.params.id1);
//     const profile2 = await Profile.findById(req.params.id2);

//     await profile1.following.push(profile2);
//     await profile2.followers.push(profile1);

//     await profile1.save();
//     await profile2.save();

//     res.send();
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// UNFOLLOW
// router.post('/:id1/unfollow/:id2', async (req, res) => {
//   try {
//     const profile1 = await Profile.findById(req.params.id1);
//     const profile2 = await Profile.findById(req.params.id2);

//     await profile1.following.push(profile2);
//     await profile2.followers.push(profile1);

//     await profile1.save();
//     await profile2.save();

//     res.send();
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });


module.exports = router;