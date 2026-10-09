const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const memoryRoutes = require('./routes/memoryRoutes');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', memoryRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('OUR LORE API is running. MongoDB & Cloudinary connected.');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Live on http://localhost:${PORT}`);
});