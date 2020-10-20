const express = require('express');
const db = require('mongoose');
const Post = require('../models/Post');
const Profile = require('../models/Profile');
const Comment = require('../models/Comment');

const router = express.Router();

router.post('/post_comment/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    let comment = new Comment({
      comment: req.body.comment,
      profile: db.Types.ObjectId(req.body.profile),
    });

    await comment.save();
    await post.comments.push(comment);
    await post.save();
    comment = await comment.populate({ path: 'profile' }).execPopulate();
    res.send(comment);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;