import mongoose from "mongoose";
import dotenv from "dotenv";

export const initDb = async () => {
  // Load environment variables
  dotenv.config();

  // pull secrets
  const { MONGO_USERNAME, MONGO_PASSWORD } = process.env;

  // check if secrets are present
  if (!MONGO_USERNAME || !MONGO_PASSWORD) {
    throw new Error("MongoDB credentials not found in environment variables");
  }

  // build uri
  const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster08543.uoqwu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster08543`;

  try {
    await mongoose.connect(uri);
    console.log("Successfully connected to MongoDB using Mongoose!");
  } catch (error: any) {
    console.error(
      "Failed to connect to MongoDB:",
      error?.message ?? "Unknown error",
    );
    throw error;
  }
};

// Handling connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});
