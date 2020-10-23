// DEPENDENCIES IMPORT
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

const { addUser, getUser, removeUser, getUsersInRoom } = require('./helper')

dotenv.config();

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

// FOLDER IMPORTS
const initializePassport = require('../config/passport');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');
const profileRoutes = require('../routes/profile');
const postRoutes = require('../routes/post');
const commentRoutes = require('../routes/comment');
const followRoutes = require('../routes/follow');
const messageRoutes = require('../routes/message');

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
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(session({
  secret: process.env.SECRET_TOKEN,
  resave: true,
  saveUninitialized: true,
}));
app.use(cookieParser(process.env.SECRET_TOKEN));
app.use(passport.initialize());
app.use(passport.session());
initializePassport(passport);

io.on('connection', (socket) => {
  console.log(`connected ${socket.id}`)

  socket.on('join', ({ profile, chat }, callback) => {
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

  socket.on('forceDisconnect', () => {
    const user = removeUser(socket.id);
    console.log(`disconnected`);
    socket.disconnect();
  });
});

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/messages', messageRoutes);
