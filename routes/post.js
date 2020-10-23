const express = require('express');
const db = require('mongoose');
const { cloudinary } = require('../config/cloudinary');

const Post = require('../models/Post');
const Profile = require('../models/Profile');

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    let image = req.body.image;
    if (image) {
      response = await cloudinary.uploader.upload(image, {
        upload_preset: 'mern_app'
      });
      image = response.secure_url;
    }

    const profile = await Profile.findById(req.body.profile);
    const post = new Post({
      image: image,
      caption: req.body.caption,
      profile: profile._id,
    });

    await post.save();
    res.send(post);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/get_post_details/:id/u/:username', async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    const post = await Post.findOne({
      _id: req.params.id,
      profile: db.Types.ObjectId(profile._id)
    }).populate({
      path: 'profile likes comments', options: { sort: { createdAt: -1 } },
      populate: [{
        path: 'profile', select: 'username is_private'
      }]
    })
    res.send(post);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/u/:username', async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    const posts = await Post.find(
      { profile: db.Types.ObjectId(profile._id) }).sort('-createdAt');
    res.send(posts);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/newsfeed/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    await profile.following.push(profile._id);

    const posts = await Post.find({
      profile: {
        $in: profile.following
      }
    }).populate({ path: 'profile likes' }).sort('-createdAt');

    res.send(posts);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/:profileid/like/:postid', async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.postid },
      { $addToSet: { likes: req.params.profileid } },
      {
        new: true, fields: {
          likes: { $slice: -1 }
        },
      }).populate({ path: 'likes' });
    res.status(200).send(post);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/:profileid/unlike/:postid', async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.postid }, { $pull: { likes: req.params.profileid } }, { new: true }
    ).populate({ path: 'likes' });
    res.status(200).send(post);
  } catch (err) {
    res.status(400).send(err);
  }
});


module.exports = router;