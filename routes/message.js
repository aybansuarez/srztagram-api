const express = require('express');
const db = require('mongoose');
const router = express.Router();

const Profile = require('../models/Profile');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

router.get('/all/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    const chats = await Chat.find({
      profiles: db.Types.ObjectId(profile._id)
    }).populate('profiles');

    await chats.forEach(chat => {
      let index = chat.profiles.map(
        (chatProfile) => { return chatProfile._id }
      ).indexOf(profile._id);
      chat.profiles.splice(index, 1);
    });

    res.send(chats)
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/chat/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(
      req.params.id
    )
    let data;
    if (chat.messages.length > 0) {
      data = await chat.populate({ path: 'profiles messages' }).execPopulate();
    } else {
      data = await chat.populate({ path: 'profiles' }).execPopulate();
    }
    res.send(data)
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/chat/:id', async (req, res) => {
  try {
    const message = new Message({
      message: req.body.message,
      profile: db.Types.ObjectId(req.body.profile),
    });
    await message.save();

    const messageUpdated = await Chat.updateOne(
      {
        _id: db.Types.ObjectId(req.params.id),
        message: {
          $not: { $elemMatch: { $eq: message._id } }
        }
      }, {
      $addToSet: {
        messages: db.Types.ObjectId(message._id)
      }
    }
    );


    if (!messageUpdated) {
      return res.status(400).send('Error');
    }

    res.status(200).send();
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;