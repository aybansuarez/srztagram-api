const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: { unique: true, expires: '1d' }
  }
});

module.exports = mongoose.model('Token', tokenSchema);
