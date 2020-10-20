const express = require('express');
const db = require('mongoose');
// const Following = require('../models/Following');
// const Follower = require('../models/Follower');
const Profile = require('../models/Profile');

const router = express.Router();


router.get('/get_followers/:username', async (req, res) => {
  try {
    const profile = await Profile.findOne(
      { username: req.params.username }
    ).populate({ path: 'followers' });

    res.send(profile);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/get_following/:username', async (req, res) => {
  try {
    const profile = await Profile.findOne(
      { username: req.params.username }
    ).populate({ path: 'following' });

    res.send(profile);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/:id1/follow/:id2', async (req, res) => {
  try {
    const profile1 = db.Types.ObjectId(req.params.id1);
    const profile2 = db.Types.ObjectId(req.params.id2);

    if (profile1._id === profile2._id) return res.status(400).send();

    const followingQuery = {
      _id: profile1,
      following: {
        $not: { $elemMatch: { $eq: profile2 } }
      }
    };
    const followingAction = { $addToSet: { following: profile2 } };
    const followingUpdated = await Profile.updateOne(
      followingQuery, followingAction
    );

    const followersQuery = {
      _id: profile2,
      followers: {
        $not: { $elemMatch: { $eq: profile1 } }
      }
    };

    const followersAction = { $addToSet: { followers: profile1 } };
    const followerUpdated = await Profile.updateOne(
      followersQuery, followersAction
    );

    if (!followingUpdated || !followerUpdated) {
      return res.status(404).send('Unable to follow that user');
    }

    res.status(200).send();
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/:id1/unfollow/:id2', async (req, res) => {
  try {
    const profile1 = db.Types.ObjectId(req.params.id1);
    const profile2 = db.Types.ObjectId(req.params.id2);

    if (profile1._id === profile2._id) return res.status(400).send();

    const unfollowingQuery = {
      _id: profile1,
      following: { $elemMatch: { $eq: profile2 } }
    };
    const unfollowingAction = { $pull: { following: profile2 } };
    const unfollowingUpdated = await Profile.updateOne(
      unfollowingQuery, unfollowingAction
    );

    const unfollowerQuery = {
      _id: profile2,
      followers: { $elemMatch: { $eq: profile1 } }
    };
    const unfollowerAction = { $pull: { followers: profile1 } };
    const unfollowerUpdated = await Profile.updateOne(
      unfollowerQuery, unfollowerAction
    );

    if (!unfollowingUpdated || !unfollowerUpdated) {
      return res.status(404).send('Unable to unfollow that user');
    }

    res.status(200).send();
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;