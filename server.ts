import express, {
  Express,
  Request,
  Response,
} from 'express';
import { initDb } from './db';
import { errorHandler } from './middleware/errorMiddleware';
import morgan from 'morgan';
import {  UserSchema } from './models/userModel';
import { userRoutes } from './routes/user/userRoutes';
import session from 'express-session';
import dotenv from 'dotenv';
import { Document } from 'mongoose';

const app: Express = express();
const port = 3000;

// Setup basic middleware
app.use(express.json());
 // Load environment variables
 dotenv.config();
    
 const { SESSION_SECRET } = process.env;

 if(!SESSION_SECRET) {
    throw new Error('SESSION_SECRET not found in environment variables');
 }


// Add before other middleware
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));


declare module 'express-session' {
  interface SessionData {
    user: Document<UserSchema>
  }
}

// Setup routes
app.get('/api', (_req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript!');
});

app.use('/api/user', userRoutes);
// http logging middleware
app.use(morgan("dev"))
// Error handler should always be the last middleware
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
      // Initialize DB connection
      await initDb();
      // Only start listening after everything is setup
      app.listen(port, () => {
          console.log(`Server running on port ${port}`);
      });

  } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
  }
};

// Start the server
startServer();

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

export default app;