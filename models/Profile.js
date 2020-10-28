const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  name: {
    type: String,
    required: true,
    max: 100
  },
  username: {
    type: String,
    max: 25,
    unique: true,
    required: true
  },
  bio: {
    type: String,
    max: 100,
    default: ''
  },
  birthday: Date,
  is_private: {
    type: Boolean,
    default: false,
  },
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Profile'
    }
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Profile'
    }
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
  avatar: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });


module.exports = mongoose.model('Profile', profileSchema);
