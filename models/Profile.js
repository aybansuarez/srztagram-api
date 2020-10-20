const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  name: {
    type: String,
    required: true,
    max: 255
  },
  username: {
    type: String,
    max: 255,
    unique: true,
    required: true
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
  avatar: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.Types.ObjectId,
    unique: true,
    required: true,
    ref: 'User'
  }
}, { timestamps: true });


module.exports = mongoose.model('Profile', profileSchema);
