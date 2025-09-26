import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { organisationsRoutes } from './routes/organisations.routes';
import { usersRoutes } from './routes/users.routes';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Your React app URL
  credentials: true
}));
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/org', organisationsRoutes);
app.use('/users', usersRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Express RBAC API Server', status: 'running' });
}); 
// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rbac-app';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
