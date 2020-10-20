const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  comment: {
    type: String,
    required: true
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  },
  likes: [String],
}, { timestamps: true });


module.exports = mongoose.model('Comment', commentSchema);
