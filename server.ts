import express, {
  Express,
  Request,
  Response
} from 'express';
import { MongoClient } from 'mongodb';
import { initDb } from './db';
import { errorHandler } from './middleware/errorMiddleware';
import { mongoMiddleware } from './middleware/mongoMiddleware';

// Extend Express Request type to include MongoDB client
declare global {
  namespace Express {
      interface Request {
          db: MongoClient;
      }
  }
}

const startServer = async (): Promise<void> => {
  try {

      await initDb();
      app.use(mongoMiddleware);

      app.use(errorHandler);
      


  } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
  }
};

const app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript!');
});
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



startServer();

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

export default app;