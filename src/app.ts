import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import flashcardRoutes from './routes/flashcardRoutes';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { ConsoleMessages, ErrorMessages, formatErrorMessage } from './constants/errorMessages';

dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Request logging middleware (optional but helpful)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/flashcards', flashcardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const healthConfig = ErrorMessages.healthCheck();
  res.status(healthConfig.statusCode).json({
    status: 'healthy',
    message: healthConfig.message,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 Handler - must be after all valid routes
app.use('*', notFoundHandler);

// Global Error Handler - must be last middleware
app.use(errorHandler);

// MongoDB connection with better error handling
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      // Modern Mongoose connection options
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ ' + ConsoleMessages.MONGODB_CONNECTED);
  } catch (err) {
    console.error('❌ ' + ConsoleMessages.MONGODB_ERROR + ':', err);
    // Only exit in production, not in tests
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw err;
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ ' + ConsoleMessages.MONGODB_DISCONNECTED);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ ' + ConsoleMessages.MONGODB_RECONNECTED);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ ' + ConsoleMessages.MONGODB_ERROR + ':', err);
});

// Start server after DB connection
export const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`
        🚀 Server is running! 🚀
        ${formatErrorMessage(ConsoleMessages.SERVER_RUNNING, { port: PORT })}
        ${formatErrorMessage(ConsoleMessages.ENVIRONMENT, { environment: process.env.NODE_ENV || 'development' })}
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(error);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 ' + ConsoleMessages.SIGTERM_RECEIVED);
  try {
    await mongoose.connection.close();
    console.log('💤 ' + ConsoleMessages.MONGODB_CONNECTION_CLOSED);
    process.exit(0);
  } catch (err) {
    console.error(ConsoleMessages.CLOSING_MONGODB_CONNECTION_ERROR + ':', err);
    process.exit(1);
  }
});

// Graceful shutdown for SIGINT (e.g. Ctrl+C in terminal)
process.on('SIGINT', async () => {
  console.log('🛑 ' + ConsoleMessages.SIGINT_RECEIVED);
  try {
    await mongoose.connection.close();
    console.log('💤 ' + ConsoleMessages.MONGODB_CONNECTION_CLOSED);
    process.exit(0);
  } catch (err) {
    console.error(ConsoleMessages.CLOSING_MONGODB_CONNECTION_ERROR + ':', err);
    process.exit(1);
  }
});

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}

export default app;
