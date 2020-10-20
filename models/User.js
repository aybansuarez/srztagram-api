const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    min: 6,
    max: 255
  },
  email: {
    type: String,
    required: true,
    unique: true,
    min: 6,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024
  }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
