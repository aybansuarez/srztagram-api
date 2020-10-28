const express = require('express');
const db = require('mongoose');
const Profile = require('../models/Profile');
const Chat = require('../models/Chat');

const router = express.Router();

router.patch('/:id1/follow/:id2', async (req, res) => {
  try {
    const profile1 = db.Types.ObjectId(req.params.id1);
    const profile2 = db.Types.ObjectId(req.params.id2);

    if (profile1._id === profile2._id) return res.status(400).send();

    let chat = await Chat.find({ profiles: [profile1, profile2] })
    if (chat.length == 0) {
      chat = await Chat.find({ profiles: [profile2, profile1] })
      if (chat.length == 0) {
        let newChat = new Chat({
          messages: [],
          profiles: [profile1, profile2]
        })
        await newChat.save();
      }
    }

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
