import express from 'express';
import { initDb } from './db';

const app = express();
const port = 3000;

// Middleware
app.use(express.json()); 

app.use(initDb);

// Routes
app.get('/', (req, res) => {
  const test = 'test';
  res.send('Hello from Express!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});