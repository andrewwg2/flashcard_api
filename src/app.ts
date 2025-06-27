
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import flashcardRoutes from './routes/flashcardRoutes';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000'  // Replace with your React app's URL
}));
// Routes
app.use('/api/flashcards', flashcardRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('*', (req, res) => {
    res.status(404).json({
        error: `404 Not Found - The requested resource '${req.originalUrl}' was not found on this server.`
    });
});

export default app;