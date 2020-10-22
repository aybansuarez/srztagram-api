const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  profiles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Profile'
    }
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    }
  ],
});


module.exports = mongoose.model('Chat', chatSchema);
