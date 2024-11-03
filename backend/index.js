// backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const Chat=require('./models/Chat')
const app = express();

// Import Routes
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user'); // Corrected filename
const rideRoutes = require('./routes/matching'); // Corrected filename
const getpath = require('./routes/route');
const chatRoutes = require('./routes/chat');
const registerRoutes = require('./routes/register');

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, // Allow credentials (cookies) to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const MongoStore = require('connect-mongo');
// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET, // e.g., 'your_secret_key'
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: false, // Set to true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Config
require('./config/passport')(passport);

// Log session and user for debugging
// app.use((req, res, next) => {
//   console.log('Session ID:', req.sessionID);
//   console.log('User:', req.user);
//   next();
// });

// Routes (after session and passport middleware)
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/path', getpath);
app.use('/api/chat', chatRoutes);
app.use('/api/register', registerRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  // Remove deprecated options
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join a chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket joined chat: ${chatId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async ({ chatId, sender, text }) => {
    try {
      const message = { sender, text, timestamp: new Date() };
      const chat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { messages: message } },
        { new: true }
      ).populate('messages.sender', 'name email profile');

      // Emit the message to all clients in the chat room
      io.to(chatId).emit('messageReceived', message);
    } catch (error) {
      console.error('Send Message Error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
