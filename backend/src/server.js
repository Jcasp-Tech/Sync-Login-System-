require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/database');
const { authRoutes, apiClientRoutes } = require('./routes');
const { errorHandlerMiddleware } = require('./middlewares');
const apiEndpoints = require('./config/apiEndpoints');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Routes
// Client API routes
app.use('/api/v1/client/auth', authRoutes);
// API Client Management routes (for generating access keys)
app.use('/api/v1/client/auth/api-clients', apiClientRoutes);
// Service API routes (for future use)
// app.use('/api/v1/service/auth', serviceAuthRoutes);

// Root route - API Endpoints Information
app.get('/', (req, res) => {
  res.json(apiEndpoints);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware (must be last)
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

module.exports = app;