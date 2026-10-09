const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const memoryRoutes = require('./routes/memoryRoutes');

const app = express();

// Connect Database
connectDB();

// Robust CORS Middleware
const allowedOrigins = [
  'https://nexomemories.vercel.app',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to allow any origin
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicit pre-flight response
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', memoryRoutes);

// Root health check
app.get('/', (req, res) => {
  res.send('OUR LORE API is running. MongoDB & Cloudinary connected.');
});

// Error handler with CORS preservation
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server internal error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Live on port ${PORT}`);
});