import express, {
  Express,
  Request,
  Response,
} from 'express';
import { initDb } from './db';
import { errorHandler } from './middleware/errorMiddleware';
import morgan from 'morgan';
import { Alert } from './models/alertModel';

const app: Express = express();
const port = 3000;

// Setup basic middleware
app.use(express.json());

// Setup routes
app.get('/', (_req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript!');
});
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