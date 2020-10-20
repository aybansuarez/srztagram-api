const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  image: {
    type: String,
    required: true
  },
  caption: String,
  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  },
  date: {
    type: Date,
    default: Date.now
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Profile'
    }
  ],
}, { timestamps: true });


module.exports = mongoose.model('Post', postSchema);
