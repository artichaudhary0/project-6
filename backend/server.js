import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import examRoutes from './routes/exams.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5179', // Allow only frontend running on port 5179
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions)); // Apply CORS middleware with options
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/users', userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://prakisingh14:Siya14@cluster0.r4j4a.mongodb.net/ExamM')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

  const PORT = process.env.PORT || 5001;  // Change port to 5001 to avoid conflict with any other service
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
