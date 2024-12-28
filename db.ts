
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;

// Load environment variables
dotenv.config();

const uri = `mongodb+srv://${username}:${password}@cluster08543.uoqwu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster08543`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export const initDb = async () => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

