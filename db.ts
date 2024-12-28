import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';


let client: MongoClient | null = null;

export const initDb = async (): Promise<MongoClient> => {
    // Load environment variables
    dotenv.config();
    
    // pull secrets
    const { MONGO_USERNAME, MONGO_PASSWORD } = process.env;

    // check if secrets are present
    if (!MONGO_USERNAME || !MONGO_PASSWORD) {
        throw new Error('MongoDB credentials not found in environment variables');
    }

    // build uri
    const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster08543.uoqwu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster08543`;
    
    // connect to db
    try {
   
        // build mongo client with options
        client = new MongoClient(uri, {
            connectTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        // connect to db
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");
        return client;
    } catch (error: any) {
        console.error('Failed to connect to MongoDB:', error?.message ?? 'Unknown error');
        throw error;
    }
};

export const getClient = (): MongoClient => {
    if (!client) {
        throw new Error('Database not initialized. Call initDb() first.');
    }
    return client;
};

export const closeConnection = async (): Promise<void> => {
    if (client) {
        await client.close();
        client = null;
        console.log('MongoDB connection closed');
    }
};

// Optional: Handle process termination
process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
});