const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  message: {
    type: String,
    required: true,
    max: 100
  },
  profile: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Profile'
  }
}, { timestamps: true });


module.exports = mongoose.model('Message', messageSchema);
