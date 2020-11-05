// DEPENDENCIES IMPORT
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

const { addUser, getUser, removeUser, getProfile } = require('./helper')

dotenv.config();

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

// DATABASE
mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => {
    console.log('MongoDB database connection established successfully');
    server.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

// MIDDLEWARE
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

io.on('connection', (socket) => {
  console.log(`connected ${socket.id}`)

  socket.on('login', ({ profile }, callback) => {
    const { error, user } = addUser({ id: socket.id, profile, chat: profile });
    if (error) return callback(error);
    socket.join(user.chat);
    callback();
  })

  socket.on('like', ({ profile, liker, post }, callback) => {
    const user = getProfile(profile);
    if (user)
      io.to(user.chat).emit('notification', { liker, post });
    callback();
  })

  socket.on('joinChat', ({ profile, chat }, callback) => {
    const { error, user } = addUser({ id: socket.id, profile, chat });
    if (error) return callback(error);
    socket.join(user.chat);
    callback();
  })

  socket.on('sendMessage', ({ message, profile }, callback) => {
    const user = getUser(socket.id);
    io.to(user.chat).emit('message', { message, profile });
    callback();
  })

  socket.on('disconnect', () => {
    removeUser(socket.id);
    console.log(`disconnected ${socket.id}`)
  })

  socket.on('forceDisconnect', () => {
    removeUser(socket.id);
    console.log(`disconnected ${socket.id}`);
    socket.disconnect();
  });
});

// ROUTES
app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/user'));
app.use('/api/profiles', require('../routes/profile'));
app.use('/api/posts', require('../routes/post'));
app.use('/api/comments', require('../routes/comment'));
app.use('/api/follows', require('../routes/follow'));
app.use('/api/messages', require('../routes/message'));
